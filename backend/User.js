// ============================================================
//  CampusGPT — User Schema
//  Stores student accounts with bcrypt-hashed passwords
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type:      String,
    required:  [true, 'Username is required'],
    unique:    true,
    trim:      true,
    minlength: [3,  'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be under 30 characters'],
    match:     [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscore'],
  },
  email: {
    type:     String,
    required: [true, 'Email is required'],
    unique:   true,
    trim:     true,
    lowercase: true,
    match:    [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select:    false,  // Never return password in queries by default
  },
  registrationNumber: {
    type:  String,
    trim:  true,
    default: '',
  },
  university: {
    type:    String,
    trim:    true,
    default: 'SZABIST',
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

// ─── Hash password before saving ─────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare password method ──────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Remove sensitive fields from JSON output ─────────────
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
