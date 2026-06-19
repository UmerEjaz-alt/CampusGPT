// ============================================================
//  CampusGPT — Centralized API Routes
// ============================================================

const express = require('express');
const router  = express.Router();

const { protect } = require('./auth');

const {
  validate, registerSchema, loginSchema,
  chatSchema, quizSchema, guideSchema, taskUpdateSchema,
} = require('./validate');

const { register, login, logout, getMe } = require('./authController');

const { chatStream, generateQuiz, submitQuiz, generateGuide } = require('./aiController');

const {
  getDashboard, getChatHistory, getChatSession,
  deleteChatSession, getQuizHistory, getGuides, updateTask,
} = require('./userController');

// ─── Auth Routes ──────────────────────────────────────────
router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login',    validate(loginSchema),    login);
router.post('/auth/logout',   logout);
router.get( '/auth/me',       protect, getMe);

// ─── AI Routes (protected) ────────────────────────────────
router.post('/chat/stream',    protect, validate(chatSchema),  chatStream);
router.post('/quiz/generate',  protect, validate(quizSchema),  generateQuiz);
router.post('/quiz/submit',    protect,                        submitQuiz);
router.post('/guide/generate', protect, validate(guideSchema), generateGuide);

// ─── User / History Routes (protected) ───────────────────
router.get( '/user/dashboard',        protect, getDashboard);
router.get( '/user/chats',            protect, getChatHistory);
router.get( '/user/chats/:id',        protect, getChatSession);
router.delete('/user/chats/:id',      protect, deleteChatSession);
router.get( '/user/quizzes',          protect, getQuizHistory);
router.get( '/user/guides',           protect, getGuides);
router.put( '/user/guides/task',      protect, validate(taskUpdateSchema), updateTask);

module.exports = router;