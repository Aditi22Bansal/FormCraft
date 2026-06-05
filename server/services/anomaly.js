const crypto = require('crypto');
const Response = require('../models/Response');

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip || 'unknown').digest('hex').slice(0, 16);
}

function isGibberish(text) {
  if (!text || typeof text !== 'string' || text.length < 6) return false;
  const str = text.trim();
  if (str.includes(' ')) return false;
  if (str !== str.toLowerCase()) return false;
  const unique = new Set(str).size;
  const entropy = unique / str.length;
  return entropy > 0.6 && /^[a-z]+$/.test(str);
}

function hashAnswers(answers) {
  const normalized = answers.map((a) => `${a.fieldId}:${JSON.stringify(a.value)}`).sort().join('|');
  return crypto.createHash('md5').update(normalized).digest('hex');
}

async function detectAnomalies({ formId, answers, completionTime, ip, fields }) {
  const reasons = [];
  const ipHash = hashIp(ip);

  if (completionTime < 8) reasons.push('Bot-like speed');

  const recent = await Response.findOne({
    formId,
    ipHash,
    submittedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });
  if (recent) reasons.push('Duplicate submission');

  for (const answer of answers) {
    const field = fields.find((f) => f.id === answer.fieldId);
    if (!field || !['text', 'textarea'].includes(field.type)) continue;
    const val = String(answer.value || '');
    if (isGibberish(val)) { reasons.push('Gibberish detected'); break; }
  }

  const answerHash = hashAnswers(answers);
  const recentResponses = await Response.find({ formId }).sort({ submittedAt: -1 }).limit(50).select('answers');
  for (const r of recentResponses) {
    if (hashAnswers(r.answers) === answerHash) { reasons.push('Duplicate answers'); break; }
  }

  let confidence = 'low';
  if (reasons.length >= 3) confidence = 'high';
  else if (reasons.length >= 1) confidence = 'medium';

  return {
    ipHash,
    anomalySummary: { flagged: reasons.length > 0, reasons, confidence },
    answerFlags: answers.map((a) => {
      const field = fields.find((f) => f.id === a.fieldId);
      const flags = [];
      if (field && ['text', 'textarea'].includes(field.type) && isGibberish(String(a.value || ''))) {
        flags.push('Gibberish detected');
      }
      return { ...a, anomalyFlags: flags };
    }),
  };
}

module.exports = { detectAnomalies, hashIp, isGibberish };
