const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    formVersion: { type: Number, default: 1 },
    answers: [answerSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Response', responseSchema);
