export function getAnswerValue(answers, fieldId) {
  const answer = answers.find((a) => a.fieldId === fieldId);
  const value = answer?.value ?? '';
  return Array.isArray(value) ? value.join(',') : String(value);
}

export function evaluateCondition(field, answers) {
  const logic = field.conditionalLogic;
  if (!logic?.dependsOn) return true;
  const target = getAnswerValue(answers, logic.dependsOn);
  const matches = target === logic.value || target.includes(logic.value);
  return logic.action === 'hide' ? !matches : matches;
}

export function getVisibleFields(fields, answers) {
  return fields.filter((f) => evaluateCondition(f, answers));
}

export const FIELD_TYPE_KEYWORDS = {
  email: ['email', 'mail', 'e-mail'],
  number: ['phone', 'mobile', 'contact', 'age', 'quantity', 'amount'],
  date: ['date', 'birthday', 'dob', 'schedule', 'when'],
  rating: ['rating', 'score', 'stars', 'satisfaction'],
  textarea: ['address', 'location', 'description', 'comment', 'feedback', 'message', 'bio'],
  text: ['name', 'full name', 'first name', 'last name', 'title', 'company'],
};

export function suggestFieldType(label) {
  const lower = label.toLowerCase();
  for (const [type, keywords] of Object.entries(FIELD_TYPE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return type;
  }
  return null;
}

export function genFieldId() {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function makeField(type) {
  return {
    id: genFieldId(),
    type,
    label: '',
    placeholder: '',
    helperText: '',
    required: false,
    options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : [],
    characterLimit: null,
    conditionalLogic: { dependsOn: null, value: '', action: 'show' },
  };
}
