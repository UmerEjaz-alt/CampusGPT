// ============================================================
//  CampusGPT — Production Backend Server v2
//  Express + Helmet + Rate Limiting + CORS + Cookie Auth
//  + Compression + Morgan logging + trust proxy for Railway
// ============================================================

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const compression  = require('compression');
const morgan       = require('morgan');
const path         = require('path');
const connectDB    = require('./db');
const apiRoutes    = require('./api');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ─── Connect MongoDB ──────────────────────────────────────
connectDB();

// ─── Trust proxy (needed for Railway / Heroku) ───────────
app.set('trust proxy', 1);

// ─── Compression (gzip all responses) ────────────────────
app.use(compression());

// ─── Request logging ──────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev'));

// ─── Security Headers ─────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:'],
      frameSrc:   ["'none'"],
    },
  },
}));

// ─── CORS ─────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl) in dev
    if (!origin && !isProd) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsers ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Rate Limiters ────────────────────────────────────────
const makeLimiter = (windowMs, max, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false,
    message: { error: message },
    skip: (req) => !isProd && req.ip === '::1',  // Skip localhost in dev
  });

app.use('/api/auth',  makeLimiter(15 * 60 * 1000, 20,  'Too many auth attempts. Try again in 15 minutes.'));
app.use('/api/chat',  makeLimiter(60 * 1000,       15,  'AI rate limit: 15 requests/minute. Please wait.'));
app.use('/api/quiz',  makeLimiter(60 * 1000,       15,  'AI rate limit: 15 requests/minute. Please wait.'));
app.use('/api/guide', makeLimiter(60 * 1000,       10,  'AI rate limit: 10 requests/minute. Please wait.'));
app.use(             makeLimiter(15 * 60 * 1000, 300,  'Too many requests. Please try again later.'));

// ─── API Routes ───────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    env:       process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()) + 's',
  });
});

// ─── 404 ──────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  // Don't leak stack traces in production
  const message = isProd && err.status !== 400 && err.status !== 401 && err.status !== 429
    ? 'Something went wrong. Please try again.'
    : err.message || 'Internal server error.';
  console.error(`[${new Date().toISOString()}] ERROR ${err.status || 500}: ${err.message}`);
  res.status(err.status || 500).json({ error: message });
});

// ─── Graceful shutdown ────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`\n  🎓  CampusGPT Backend`);
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log(`  📦  env: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🗄️   MongoDB: ${process.env.MONGODB_URI ? '✅ configured' : '❌ NOT SET'}`);
  console.log(`  🤖  Groq:    ${process.env.GROQ_API_KEY ? '✅ configured' : '❌ NOT SET'}`);
  console.log(`  🔒  JWT:     ${process.env.JWT_SECRET   ? '✅ configured' : '❌ NOT SET'}\n`);
});

module.exports = app;
