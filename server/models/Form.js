const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'textarea', 'dropdown', 'checkbox', 'radio', 'date', 'rating', 'file', 'signature'],
    required: true,
  },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  helperText: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  characterLimit: { type: Number, default: null },
  regexPattern: { type: String, default: null },
  conditionalLogic: {
    dependsOn: { type: String, default: null },
    value: { type: String, default: '' },
    action: { type: String, enum: ['show', 'hide'], default: 'show' },
  },
  correctAnswer: { type: String, default: null },
  timeLimit: { type: Number, default: null },
  suggestion: { type: String, default: null },
}, { _id: false });

const stepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  fieldIds: [{ type: String }],
}, { _id: false });

const formSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  fields: [fieldSchema],
  steps: [stepSchema],
  settings: {
    conversationalMode: { type: Boolean, default: false },
    quizMode: { type: Boolean, default: false },
    timeLimit: { type: Number, default: null },
    theme: { primaryColor: { type: String, default: '#7C6FCD' } },
    closeDate: { type: Date, default: null },
    maxResponses: { type: Number, default: null },
    password: { type: String, default: null },
    redirectUrl: { type: String, default: null },
    thankYouMessage: { type: String, default: 'Thank you for your submission!' },
  },
  version: { type: Number, default: 1 },
  versions: [{ version: Number, title: String, fields: [fieldSchema], savedAt: { type: Date, default: Date.now } }],
  collaborators: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, role: String }],
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  viewCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);
