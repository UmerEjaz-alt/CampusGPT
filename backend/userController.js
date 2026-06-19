// ============================================================
//  CampusGPT — User Controller
//  Dashboard stats, chat history, quiz history, task updates
// ============================================================

const ChatSession = require('./Chat');
const QuizRecord  = require('./Quiz');
const StudyGuide  = require('./Guide');
// ─── GET /api/user/dashboard ──────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [chatCount, quizCount, guideCount, recentQuizzes] = await Promise.all([
      ChatSession.countDocuments({ user: userId }),
      QuizRecord.countDocuments({ user: userId, completed: true }),
      StudyGuide.countDocuments({ user: userId }),
      QuizRecord.find({ user: userId, completed: true })
        .sort({ createdAt: -1 }).limit(5)
        .select('topic difficulty percentage createdAt'),
    ]);

    // Average quiz score
    const scoreAgg = await QuizRecord.aggregate([
      { $match: { user: userId, completed: true } },
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } },
    ]);
    const avgScore = scoreAgg[0]?.avgScore ? Math.round(scoreAgg[0].avgScore) : 0;

    res.json({
      stats: { chatCount, quizCount, guideCount, avgScore },
      recentQuizzes,
    });

  } catch (err) {
    console.error('[Dashboard Error]', err.message);
    res.status(500).json({ error: 'Could not load dashboard.' });
  }
};

// ─── GET /api/user/chats ──────────────────────────────────
const getChatHistory = async (req, res) => {
  try {
    const sessions = await ChatSession
      .find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(30)
      .select('title updatedAt createdAt');

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch chat history.' });
  }
};

// ─── GET /api/user/chats/:id ──────────────────────────────
const getChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch session.' });
  }
};

// ─── DELETE /api/user/chats/:id ───────────────────────────
const deleteChatSession = async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Chat session deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete session.' });
  }
};

// ─── GET /api/user/quizzes ────────────────────────────────
const getQuizHistory = async (req, res) => {
  try {
    const quizzes = await QuizRecord
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('topic difficulty score total percentage completed createdAt');

    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch quiz history.' });
  }
};

// ─── GET /api/user/guides ─────────────────────────────────
const getGuides = async (req, res) => {
  try {
    const guides = await StudyGuide
      .find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json({ guides });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch study guides.' });
  }
};

// ─── PUT /api/user/guides/task ────────────────────────────
// Toggle a task's completion state
const updateTask = async (req, res) => {
  try {
    const { guideId, stepIndex, taskIndex, completed } = req.validatedBody;

    const guide = await StudyGuide.findOne({ _id: guideId, user: req.user._id });
    if (!guide) return res.status(404).json({ error: 'Guide not found.' });

    if (!guide.steps[stepIndex]?.tasks[taskIndex]) {
      return res.status(400).json({ error: 'Invalid step or task index.' });
    }

    guide.steps[stepIndex].tasks[taskIndex].completed = completed;
    await guide.save();  // Pre-save hook recalculates progress

    res.json({ progress: guide.progress });

  } catch (err) {
    res.status(500).json({ error: 'Could not update task.' });
  }
};

module.exports = {
  getDashboard,
  getChatHistory,
  getChatSession,
  deleteChatSession,
  getQuizHistory,
  getGuides,
  updateTask,
};