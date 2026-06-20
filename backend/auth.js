// ============================================================
//  CampusGPT — Auth Middleware
//  Reads JWT from cookie, Authorization header, or query param for cross-platform compatibility
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('./User');

const protect = async (req, res, next) => {
  try {
    // 1. Try reading token from cookie. 
    let token = req.cookies?.token;

    // 2. Fallback to extracting it from the Authorization Bearer header (for mobile devices)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 3. Fallback to extracting it from query parameters (specifically for mobile streaming endpoints)
    if (!token && req.query?.token) {
      token = req.query.token;
    }

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