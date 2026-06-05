const Sentiment = require('sentiment');
const analyzer = new Sentiment();

function analyzeText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { score: 0, label: 'neutral' };
  }
  const result = analyzer.analyze(text);
  let label = 'neutral';
  if (result.score > 0) label = 'positive';
  else if (result.score < 0) label = 'negative';
  return { score: result.score, label };
}

function analyzeAnswers(fields, answers) {
  return answers.map((answer) => {
    const field = fields.find((f) => f.id === answer.fieldId);
    if (!field || !['text', 'textarea'].includes(field.type)) {
      return { ...answer };
    }
    const value = Array.isArray(answer.value) ? answer.value.join(' ') : String(answer.value || '');
    return { ...answer, sentiment: analyzeText(value) };
  });
}

module.exports = { analyzeText, analyzeAnswers };
