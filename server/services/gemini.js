const { GoogleGenerativeAI } = require('@google/generative-ai');

const FORM_SYSTEM = `You are a form builder assistant. Given a description, return a JSON array of form fields. Each field has: id (unique string), type (text/email/number/textarea/dropdown/radio/checkbox/date/rating), label, placeholder, required (boolean), options (array, only for dropdown/radio/checkbox). Return only valid JSON array, no explanation, no markdown.`;

const FOLLOWUP_SYSTEM = `Given these form responses, generate 2 follow-up questions that would deepen understanding of the respondent's answers. Return JSON array: [{question, type, options}]. type can be text/radio/dropdown. Keep questions short and relevant. Return only JSON.`;

const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelay(err) {
  const match = err.message?.match(/retry in ([\d.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : 12000;
}

function friendlyError(err) {
  const msg = err.message || '';
  if (msg.includes('429') || msg.includes('quota') || msg.includes('Quota exceeded')) {
    return 'Gemini API quota exceeded. Wait a minute and retry, or create a new API key at https://aistudio.google.com/apikey (keys start with AIzaSy). Enable billing if you need higher limits.';
  }
  if (msg.includes('404') || msg.includes('not found')) {
    return 'Gemini model not available. Set GEMINI_MODEL in server/.env to gemini-2.5-flash and restart the server.';
  }
  if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
    return 'Invalid Gemini API key. Get a new key from https://aistudio.google.com/apikey';
  }
  return msg;
}

async function tryGenerate(genAI, modelName, prompt, systemPrompt, retries = 1) {
  const model = genAI.getGenerativeModel({ model: modelName });
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
      const text = result.response.text().trim();
      const match = text.match(/\[[\s\S]*\]/);
      return JSON.parse(match ? match[0] : text);
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('quota');
      if (is429 && attempt < retries) {
        await sleep(parseRetryDelay(err));
        continue;
      }
      throw err;
    }
  }
}

async function callOpenRouter(prompt, systemPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim() || 'openrouter/free';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5000',
      'X-Title': 'FormCraft',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from OpenRouter');

  const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}

async function callGemini(prompt, systemPrompt) {
  if (process.env.OPENROUTER_API_KEY?.trim()) {
    try {
      return await callOpenRouter(prompt, systemPrompt);
    } catch (err) {
      console.warn('OpenRouter call failed, falling back to direct Gemini:', err.message);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured — add it to server/.env and restart the server');

  const genAI = new GoogleGenerativeAI(apiKey);
  const preferred = process.env.GEMINI_MODEL?.trim();
  const models = preferred ? [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)] : FALLBACK_MODELS;

  let lastError;
  for (const modelName of models) {
    try {
      return await tryGenerate(genAI, modelName, prompt, systemPrompt);
    } catch (err) {
      lastError = err;
      const isAuthError = err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid');
      if (isAuthError) break;
      console.warn(`Gemini model ${modelName} failed: ${err.message}`);
    }
  }

  throw new Error(friendlyError(lastError));
}

async function generateFormFields(description) {
  const fields = await callGemini(`Form description: ${description}`, FORM_SYSTEM);
  if (!Array.isArray(fields)) throw new Error('Invalid AI response format');
  return fields.map((f, i) => ({
    id: f.id || `field_${Date.now()}_${i}`,
    type: f.type || 'text',
    label: f.label || `Field ${i + 1}`,
    placeholder: f.placeholder || '',
    helperText: '',
    required: Boolean(f.required),
    options: f.options || [],
    characterLimit: null,
    conditionalLogic: { dependsOn: null, value: '', action: 'show' },
  }));
}

async function generateFollowUp(answers, fields) {
  const summary = answers.map((a) => {
    const field = fields.find((f) => f.id === a.fieldId);
    return `${field?.label || a.fieldId}: ${JSON.stringify(a.value)}`;
  }).join('\n');
  return callGemini(`Responses:\n${summary}`, FOLLOWUP_SYSTEM);
}

module.exports = { generateFormFields, generateFollowUp };
