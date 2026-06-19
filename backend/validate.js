// ============================================================
//  CampusGPT — Zod Input Validation Middleware
//  Validates all incoming request bodies before controllers
// ============================================================

const { z } = require('zod');

// ─── Schemas ──────────────────────────────────────────────

const registerSchema = z.object({
  username: z.string()
    .min(3,  'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscore'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8,  'Password must be at least 8 characters')
    .max(72, 'Password too long'),
  registrationNumber: z.string().max(20).optional(),
  university: z.string().max(100).optional(),
});

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const chatSchema = z.object({
  message: z.string()
    .min(1,    'Message cannot be empty')
    .max(4000, 'Message too long (max 4000 characters)'),
  sessionId: z.string().optional(),
  history: z.array(z.object({
    role:    z.enum(['user', 'assistant']),
    content: z.string().max(8000),
  })).max(40, 'History too long').optional(),
});

const quizSchema = z.object({
  topic:      z.string().min(1, 'Topic is required').max(200, 'Topic too long'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  count:      z.number().int().min(1).max(10).default(5),
});

const guideSchema = z.object({
  topic:    z.string().min(1, 'Topic is required').max(200, 'Topic too long'),
  level:    z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  duration: z.enum(['1 Week', '2 Weeks', '1 Month']).default('1 Week'),
});

const taskUpdateSchema = z.object({
  guideId:   z.string().min(1, 'Guide ID required'),
  stepIndex: z.number().int().min(0),
  taskIndex: z.number().int().min(0),
  completed: z.boolean(),
});

// ─── Middleware Factory ───────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message);
    return res.status(400).json({ error: errors[0], details: errors });
  }
  req.validatedBody = result.data;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  chatSchema,
  quizSchema,
  guideSchema,
  taskUpdateSchema,
};
