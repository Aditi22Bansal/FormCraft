const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'email', 'number', 'textarea', 'dropdown', 'checkbox', 'radio', 'date'],
      required: true,
    },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    conditional: {
      fieldId: { type: String, default: null },
      operator: { type: String, enum: ['equals', 'not_equals', 'contains'], default: 'equals' },
      value: { type: String, default: '' },
    },
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    fields: [fieldSchema],
    slug: { type: String, required: true, unique: true },
    version: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    versionHistory: [
      {
        version: Number,
        title: String,
        fields: [fieldSchema],
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Form', formSchema);
