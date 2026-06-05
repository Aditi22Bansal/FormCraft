const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: { type: String, enum: ['click', 'focus', 'blur', 'scroll', 'abandon'], required: true },
  fieldId: { type: String, default: null },
  x: { type: Number, default: null },
  y: { type: Number, default: null },
  scrollY: { type: Number, default: null },
  timeSpent: { type: Number, default: null },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const formSessionSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  sessionId: { type: String, required: true },
  events: [eventSchema],
}, { timestamps: true });

formSessionSchema.index({ formId: 1, sessionId: 1 });

module.exports = mongoose.model('FormSession', formSessionSchema);
