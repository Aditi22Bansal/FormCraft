function getAnswerValue(answers, fieldId) {
  const answer = answers.find((a) => a.fieldId === fieldId);
  const value = answer?.value ?? '';
  return Array.isArray(value) ? value.join(',') : String(value);
}

function evaluateCondition(field, answers) {
  const logic = field.conditionalLogic;
  if (!logic?.dependsOn) return true;

  const target = getAnswerValue(answers, logic.dependsOn);
  const condValue = logic.value ?? '';
  const matches = target === condValue || target.includes(condValue);

  return logic.action === 'hide' ? !matches : matches;
}

function getVisibleFields(fields, answers) {
  return fields.filter((f) => evaluateCondition(f, answers));
}

function validateAnswers(fields, answers) {
  const errors = [];
  for (const field of fields) {
    if (!field.required) continue;
    const answer = answers.find((a) => a.fieldId === field.id);
    const value = answer?.value;
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      errors.push(`${field.label || field.id} is required`);
    }
    if (field.characterLimit && typeof value === 'string' && value.length > field.characterLimit) {
      errors.push(`${field.label || field.id} exceeds character limit`);
    }
  }
  return errors;
}

function escapeCsv(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

module.exports = { getVisibleFields, validateAnswers, escapeCsv, evaluateCondition };
