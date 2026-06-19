// ============================================================
//  CampusGPT — Study Guide Schema
//  Stores AI-generated roadmaps with task completion tracking
// ============================================================

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { _id: false });

const StepSchema = new mongoose.Schema({
  day:       { type: String, required: true },
  title:     { type: String, required: true },
  desc:      { type: String, default: '' },
  tasks:     { type: [TaskSchema], default: [] },
  resources: { type: [String], default: [] },
}, { _id: false });

const StudyGuideSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  topic:    { type: String, required: true, maxlength: 200 },
  level:    { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: '1 Week' },
  overview: {
    days:     { type: Number, default: 0 },
    hours:    { type: Number, default: 0 },
    topics:   { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
  },
  steps:     { type: [StepSchema], default: [] },
  progress:  { type: Number, default: 0 },  // 0-100 percentage
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ─── Auto-calculate progress ──────────────────────────────
StudyGuideSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  const allTasks  = this.steps.flatMap(s => s.tasks);
  const doneTasks = allTasks.filter(t => t.completed).length;
  this.progress   = allTasks.length > 0
    ? Math.round((doneTasks / allTasks.length) * 100)
    : 0;
  next();
});

module.exports = mongoose.model('StudyGuide', StudyGuideSchema);
