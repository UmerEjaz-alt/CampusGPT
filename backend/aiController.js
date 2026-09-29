// ============================================================
//  CampusGPT — AI Controller v2
//  Chat (SSE streaming), Quiz generation, Study Guide
//  Uses node-fetch v2 with robust stream parsing
// ============================================================

const fetch       = require('node-fetch');
const ChatSession = require('./Chat');
const QuizRecord  = require('./Quiz');
const StudyGuide  = require('./Guide');
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

const SYSTEM_PROMPTS = {
  chat: `You are CampusGPT, a knowledgeable and friendly AI academic assistant for university students.

Your role: help students understand concepts, answer academic questions, and explain topics clearly step by step.

Writing rules (always follow):
- Write in clear, natural, grammatically correct English
- Never repeat the same word or phrase consecutively (e.g. avoid "problem problem" or "is is")
- Do not loop, stutter, or restate the same point redundantly
- Use complete sentences with proper structure
- Be concise but thorough — quality over quantity
- Maintain a professional, encouraging tone like ChatGPT

Formatting:
- Use **bold** for key terms
- Use numbered lists for sequential steps
- Use bullet points for lists of features or concepts
- Use markdown code blocks with language tags for any code
- Separate distinct ideas into paragraphs with blank lines between them`,

  quiz: `You are an academic quiz generator. Return only the requested JSON object. Keep each question accurate, unambiguous, and appropriate for university students.`,

  guide: `You are an academic study guide generator. Respond ONLY with a valid JSON object — no markdown, no explanation, no code fences, no text before or after the object.`,
};

// ─── Clean repetitive patterns from AI output ───────────
function cleanResponse(text) {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text;

  // Remove consecutive duplicate words (case-insensitive)
  cleaned = cleaned.replace(/\b(\w+)(\s+\1\b)+/gi, '$1');

  // Remove consecutive duplicate 2-word phrases
  cleaned = cleaned.replace(/\b(\w+\s+\w+)(?:\s+\1\b)+/gi, '$1');

  // Collapse excessive whitespace
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

// ─── Build Groq request ───────────────────────────────────
function buildGroqBody(messages, maxTokens, stream, responseFormat) {
  const body = {
    model:       GROQ_MODEL,
    messages,
    max_tokens:  maxTokens,
    temperature: 0.6,
    top_p:       0.9,
    stream,
  };
  if (responseFormat) body.response_format = responseFormat;
  return body;
}

// ─── Groq fetch helper (non-streaming) ───────────────────
async function callGroq(messages, maxTokens = 1024, responseFormat) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw Object.assign(new Error('GROQ_API_KEY not configured.'), { status: 500 });

  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(buildGroqBody(messages, maxTokens, false, responseFormat)),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Groq error ${res.status}`;
    if (res.status === 401) throw Object.assign(new Error('Invalid Groq API key.'),      { status: 401 });
    if (res.status === 429) throw Object.assign(new Error('Groq rate limit reached.'),   { status: 429 });
    throw Object.assign(new Error(msg), { status: 502 });
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

const quizResponseFormat = (count) => ({
  type: 'json_schema',
  json_schema: {
    name: 'campus_quiz',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['questions'],
      properties: {
        questions: {
          type: 'array',
          minItems: count,
          maxItems: count,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['q', 'options', 'ans', 'explanation'],
            properties: {
              q: { type: 'string' },
              options: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
              ans: { type: 'integer', minimum: 0, maximum: 3 },
              explanation: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const guideResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'campus_study_guide',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['overview', 'steps'],
      properties: {
        overview: {
          type: 'object',
          additionalProperties: false,
          required: ['days', 'hours', 'topics', 'projects'],
          properties: {
            days: { type: 'integer', minimum: 1 },
            hours: { type: 'integer', minimum: 1 },
            topics: { type: 'integer', minimum: 1 },
            projects: { type: 'integer', minimum: 0 },
          },
        },
        steps: {
          type: 'array',
          minItems: 5,
          maxItems: 7,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['day', 'title', 'desc', 'tasks', 'resources'],
            properties: {
              day: { type: 'string' },
              title: { type: 'string' },
              desc: { type: 'string' },
              tasks: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
              resources: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
};

// ─── POST /api/chat/stream — SSE Streaming ────────────────
const chatStream = async (req, res) => {
  const { message, sessionId, history = [] } = req.validatedBody;
  const userId = req.user._id;

  // SSE headers
  res.setHeader('Content-Type',      'text/event-stream');
  res.setHeader('Cache-Control',     'no-cache, no-transform');
  res.setHeader('Connection',        'keep-alive');
  res.setHeader('X-Accel-Buffering','no');
  res.flushHeaders();

  const send = (obj) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  // Keepalive ping every 15s (prevents Nginx/Railway timeout)
  const ping = setInterval(() => { if (!res.writableEnded) res.write(': ping\n\n'); }, 15000);

  const cleanup = () => {
    clearInterval(ping);
    if (!res.writableEnded) res.end();
  };

  req.on('close', cleanup);

  const messages = [
    { role: 'system',    content: SYSTEM_PROMPTS.chat },
    ...history
      .filter(m => m.content && m.content.trim())
      .slice(-20),
    { role: 'user',      content: message },
  ];

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    send({ type: 'error', message: 'API key not configured on server.' });
    return cleanup();
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(buildGroqBody(messages, 1024, true)),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      send({ type: 'error', message: err?.error?.message || `AI error ${groqRes.status}` });
      return cleanup();
    }

    let fullContent = '';
    let buffer      = '';

    groqRes.body.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep incomplete last line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: '))         continue;

        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const token  = parsed?.choices?.[0]?.delta?.content;
          if (token) {
            fullContent += token;
            send({ type: 'token', token });
          }
        } catch (_) { /* skip malformed SSE chunk */ }
      }
    });

    groqRes.body.on('end', async () => {
      const cleanedContent = cleanResponse(fullContent);

      // Persist conversation to MongoDB
      try {
        let session = sessionId
          ? await ChatSession.findOne({ _id: sessionId, user: userId })
          : null;

        if (!session) session = new ChatSession({ user: userId, messages: [] });

        session.messages.push({ role: 'user',      content: message         });
        session.messages.push({ role: 'assistant', content: cleanedContent  });
        await session.save();
        send({ type: 'done', sessionId: session._id.toString() });
      } catch (dbErr) {
        console.error('[Chat DB save]', dbErr.message);
        send({ type: 'done', sessionId: null });
      }
      cleanup();
    });

    groqRes.body.on('error', (err) => {
      console.error('[Stream body error]', err.message);
      send({ type: 'error', message: 'Stream interrupted. Please try again.' });
      cleanup();
    });

  } catch (err) {
    console.error('[chatStream error]', err.message);
    send({ type: 'error', message: err.message || 'Failed to connect to AI service.' });
    cleanup();
  }
};

// ─── POST /api/quiz/generate ──────────────────────────────
const generateQuiz = async (req, res) => {
  const { topic, difficulty, count } = req.validatedBody;

  const prompt = `Generate exactly ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty for university students.
Use the provided response schema. Each question must have four plausible options, one correct answer index, and a concise explanation.`;

  try {
    const raw = await callGroq([
      { role: 'system', content: SYSTEM_PROMPTS.quiz },
      { role: 'user',   content: prompt },
    ], Math.max(2400, count * 450), quizResponseFormat(count));

    const payload = JSON.parse(raw);
    const questions = payload?.questions;
    if (!Array.isArray(questions) || questions.length !== count) {
      return res.status(502).json({ error: 'No complete quiz was generated. Please try again.' });
    }

    const clean = questions.map((q) => ({
      q: q.q.trim(),
      options: q.options.map(option => option.trim()),
      ans: q.ans,
      explanation: q.explanation.trim(),
    }));

    const record = await QuizRecord.create({
      user: req.user._id, topic, difficulty, questions: clean, total: clean.length,
    });

    res.json({ questions: clean, quizId: record._id });

  } catch (err) {
    console.error('[generateQuiz]', err.message);
    if (err instanceof SyntaxError) return res.status(502).json({ error: 'AI returned unparseable data. Try again.' });
    res.status(err.status || 503).json({ error: err.message || 'Could not generate quiz.' });
  }
};

// ─── POST /api/quiz/submit ────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'quizId and answers array required.' });
    }

    const record = await QuizRecord.findOne({ _id: quizId, user: req.user._id });
    if (!record) return res.status(404).json({ error: 'Quiz not found.' });
    if (record.completed) return res.json({ score: record.score, total: record.total, percentage: record.percentage });

    let score = 0;
    answers.forEach((chosen, i) => {
      if (record.questions[i] !== undefined) {
        record.questions[i].chosen = chosen;
        if (chosen === record.questions[i].ans) score++;
      }
    });

    record.score     = score;
    record.completed = true;
    await record.save();

    res.json({ score, total: record.total, percentage: record.percentage });

  } catch (err) {
    console.error('[submitQuiz]', err.message);
    res.status(500).json({ error: 'Could not submit quiz.' });
  }
};

// ─── POST /api/guide/generate ─────────────────────────────
const generateGuide = async (req, res) => {
  const { topic, level, duration } = req.validatedBody;

  const prompt = `Create a study roadmap for learning "${topic}" for a ${level} university student over ${duration}.
Use the provided response schema. Generate 5 to 7 practical steps. Every step must have exactly 3 focused tasks and 3 useful resources.`;

  try {
    const raw = await callGroq([
      { role: 'system', content: SYSTEM_PROMPTS.guide },
      { role: 'user',   content: prompt },
    ], 4800, guideResponseFormat);

    const data = JSON.parse(raw);
    if (!Array.isArray(data.steps) || !data.steps.length) {
      return res.status(502).json({ error: 'Invalid guide structure. Please try again.' });
    }

    const steps = data.steps.map(s => ({
      day:       s.day       || '',
      title:     s.title     || '',
      desc:      s.desc      || '',
      tasks:     (Array.isArray(s.tasks)     ? s.tasks     : []).map(t => ({ text: String(t), completed: false })),
      resources: (Array.isArray(s.resources) ? s.resources : []).map(String),
    }));

    const guide = await StudyGuide.create({
      user: req.user._id, topic, level, duration,
      overview: data.overview || {}, steps,
    });

    res.json({ guide });

  } catch (err) {
    console.error('[generateGuide]', err.message);
    if (err instanceof SyntaxError) return res.status(502).json({ error: 'AI returned unparseable data. Try again.' });
    res.status(err.status || 503).json({ error: err.message || 'Could not generate study guide.' });
  }
};

module.exports = { chatStream, generateQuiz, submitQuiz, generateGuide };
