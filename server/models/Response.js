const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  sentiment: { score: { type: Number, default: 0 }, label: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' } },
  anomalyFlags: [{ type: String }],
  isCorrect: { type: Boolean, default: null },
}, { _id: false });

const journeyEntrySchema = new mongoose.Schema({
  fieldId: { type: String },
  focusedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },
  changedValue: { type: Boolean, default: false },
}, { _id: false });

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formVersion: { type: Number, default: 1 },
  answers: [answerSchema],
  followUpAnswers: [{ question: String, type: String, value: mongoose.Schema.Types.Mixed, options: [String] }],
  completionTime: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  ipHash: { type: String, default: null },
  device: { type: String, default: null },
  source: { type: String, default: null },
  referrer: { type: String, default: null },
  journeyLog: [journeyEntrySchema],
  anomalySummary: {
    flagged: { type: Boolean, default: false },
    reasons: [{ type: String }],
    confidence: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  },
  score: { type: Number, default: null },
  scoreTotal: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
