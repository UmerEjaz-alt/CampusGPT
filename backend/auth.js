// ============================================================
//  CampusGPT — Auth Middleware
//  Reads JWT from httpOnly cookie, protects private routes
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('./User');

const protect = async (req, res, next) => {
  try {
    // Read token from httpOnly cookie (never from localStorage)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ error: 'Invalid session token.' });
    }

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error('[Auth Middleware Error]', err.message);
    res.status(500).json({ error: 'Authentication error.' });
  }
};

module.exports = { protect };
