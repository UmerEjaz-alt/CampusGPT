// ============================================================
//  CampusGPT — Auth Controller
//  Register, Login, Logout, Get current user
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('./User');

// ─── Cookie config ────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly:  true,                          // No JS access — XSS protection
  secure:    process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite:  'strict',                      // CSRF protection
  maxAge:    7 * 24 * 60 * 60 * 1000,     // 7 days in ms
  path:      '/',
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// ─── POST /api/auth/register ──────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password, registrationNumber, university } = req.validatedBody;

    // Check duplicates
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered.' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken.' });

    // Create user (password hashed via pre-save hook in model)
    const user = await User.create({ username, email, password, registrationNumber, university });

    // Issue JWT in httpOnly cookie
    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id:                 user._id,
        username:           user.username,
        email:              user.email,
        registrationNumber: user.registrationNumber,
        university:         user.university,
      },
    });

  } catch (err) {
    console.error('[Register Error]', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email or username already exists.' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    // Fetch user WITH password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Issue JWT in httpOnly cookie
    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      message: 'Login successful.',
      user: {
        id:                 user._id,
        username:           user.username,
        email:              user.email,
        registrationNumber: user.registrationNumber,
        university:         user.university,
        lastLogin:          user.lastLogin,
      },
    });

  } catch (err) {
    console.error('[Login Error]', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────
const logout = (req, res) => {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ message: 'Logged out successfully.' });
};

// ─── GET /api/auth/me ─────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      user: {
        id:                 user._id,
        username:           user.username,
        email:              user.email,
        registrationNumber: user.registrationNumber,
        university:         user.university,
        createdAt:          user.createdAt,
        lastLogin:          user.lastLogin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user.' });
  }
};

module.exports = { register, login, logout, getMe };
