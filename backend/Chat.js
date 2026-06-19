// ============================================================
//  CampusGPT — Chat Session Schema
//  Persists multi-turn conversation history per user
// ============================================================

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  content:   { type: String, required: true, maxlength: 8000 },
  timestamp: { type: Date,   default: Date.now },
}, { _id: false });

const ChatSessionSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  title: {
    type:    String,
    default: 'New Chat',
    maxlength: 100,
  },
  messages: {
    type:    [MessageSchema],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 200,
      message:   'Chat session cannot exceed 200 messages',
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ─── Auto-update updatedAt ────────────────────────────────
ChatSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  // Auto-generate title from first user message
  if (this.messages.length > 0 && this.title === 'New Chat') {
    const firstMsg = this.messages.find(m => m.role === 'user');
    if (firstMsg) {
      this.title = firstMsg.content.slice(0, 60) + (firstMsg.content.length > 60 ? '…' : '');
    }
  }
  next();
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
