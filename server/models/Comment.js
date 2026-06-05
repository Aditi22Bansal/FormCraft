const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    responseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Response', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
