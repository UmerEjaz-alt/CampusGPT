// ============================================================
//  CampusGPT — Quiz Record Schema
//  Logs every quiz attempt with full question/answer data
// ============================================================

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  q:           { type: String, required: true },
  options:     { type: [String], required: true },
  ans:         { type: Number, required: true },   // correct answer index
  chosen:      { type: Number, default: -1 },       // student's chosen index
  explanation: { type: String, default: '' },
}, { _id: false });

const QuizRecordSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  topic:      { type: String, required: true, maxlength: 200 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  questions:  { type: [QuestionSchema], default: [] },
  score:      { type: Number, default: 0 },     // number correct
  total:      { type: Number, default: 0 },     // total questions
  percentage: { type: Number, default: 0 },     // 0-100
  completed:  { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
});

// ─── Auto-calculate percentage ────────────────────────────
QuizRecordSchema.pre('save', function (next) {
  if (this.total > 0) {
    this.percentage = Math.round((this.score / this.total) * 100);
  }
  next();
});

module.exports = mongoose.model('QuizRecord', QuizRecordSchema);
