import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, Award,
  ChevronRight, AlertTriangle, Trophy, Brain, Target,
  Zap, ListChecks, BarChart3, Clock,
} from 'lucide-react';
import api from './api';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import Input from './components/ui/Input';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { cn } from './components/ui/cn';

interface Question {
  q: string;
  options: string[];
  ans: number;
  explanation: string;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
type Difficulty = typeof DIFFICULTIES[number];

const diffConfig: Record<Difficulty, { active: string; glow: string; desc: string; icon: string }> = {
  Easy:   { active: 'border-green/30 bg-green/[0.08] text-green',   glow: 'shadow-[0_0_20px_rgba(79,255,176,0.08)]',   desc: 'Fundamental concepts & basic questions',       icon: '🟢' },
  Medium: { active: 'border-amber/30 bg-amber/[0.08] text-amber',   glow: 'shadow-[0_0_20px_rgba(245,176,56,0.08)]',   desc: 'Intermediate level, requires understanding',  icon: '🟡' },
  Hard:   { active: 'border-pink/30  bg-pink/[0.08]  text-pink',    glow: 'shadow-[0_0_20px_rgba(255,95,160,0.08)]',   desc: 'Advanced topics and edge cases',              icon: '🔴' },
};

const QUESTION_COUNTS = [3, 5, 10] as const;
const LETTERS = ['A', 'B', 'C', 'D'];

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ pct }: { pct: number }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#4fffb0' : pct >= 60 ? '#f5b038' : '#ff5fa0';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90" aria-hidden="true">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <motion.circle
          cx="90" cy="90" r={r}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
          style={{ filter: `drop-shadow(0 0 12px ${color}50)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="font-display text-5xl font-black text-white"
        >
          {pct}%
        </motion.span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted">Score</span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuizEngine() {
  const [topic,      setTopic]      = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [count,      setCount]      = useState<number>(5);
  const [questions,  setQuestions]  = useState<Question[]>([]);
  const [quizId,     setQuizId]     = useState<string | null>(null);
  const [answers,    setAnswers]    = useState<number[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [score,      setScore]      = useState(0);
  const [error,      setError]      = useState('');

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setQuestions([]); setAnswers([]); setSubmitted(false); setScore(0);
    try {
      const { data } = await api.post('/api/quiz/generate', { topic, difficulty, count });
      setQuestions(data.questions);
      setQuizId(data.quizId);
      setAnswers(new Array(data.questions.length).fill(-1));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const choose = (qi: number, oi: number) => {
    if (submitted || answers[qi] !== -1) return;
    const next = [...answers]; next[qi] = oi; setAnswers(next);
  };

  const submitQuiz = async () => {
    const finalScore = answers.filter((a, i) => a === questions[i]?.ans).length;
    try {
      const { data } = await api.post('/api/quiz/submit', { quizId, answers });
      setScore(data.score ?? finalScore);
    } catch { setScore(finalScore); }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetQuiz = () => { setQuestions([]); setAnswers([]); setSubmitted(false); setScore(0); setQuizId(null); setError(''); };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const allAnswered = answers.length > 0 && answers.every(a => a !== -1);
  const answeredCount = answers.filter(a => a !== -1).length;
  const scoreLabel = pct >= 80
    ? { text: 'Excellent work!',   sub: "You've mastered this topic.",             color: 'text-green', bg: 'from-green/[0.06]',  border: 'border-green/15' }
    : pct >= 60
    ? { text: 'Good effort!',      sub: 'You have a solid understanding.',         color: 'text-amber', bg: 'from-amber/[0.06]',  border: 'border-amber/15' }
    : { text: 'Keep practicing!',  sub: "Review the explanations and try again.", color: 'text-pink',  bg: 'from-pink/[0.06]',   border: 'border-pink/15'  };

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────────
  if (!questions.length && !loading) {
    return (
      <div className="min-h-screen bg-bg text-foreground">
        {/* Ambient */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute right-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-violet/[0.05] blur-[140px]" />
          <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-cyan/[0.04] blur-[120px]" />
        </div>

        {/* Hero header */}
        <section className="relative border-b border-white/[0.05] section-block-sm text-center">
          <div className="page-container max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="violet" className="mb-7">Quiz Generator</Badge>
              <h1 className="text-balance font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Test your knowledge
                <br />
                <span className="grad-text-warm">on any subject.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                Generate a custom multiple-choice quiz in seconds. Get instant feedback, detailed explanations, and track your progress over time.
              </p>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-10 flex flex-wrap justify-center gap-3"
            >
              {[
                { icon: Brain,      label: 'AI-Generated Questions' },
                { icon: Zap,        label: 'Instant Feedback'       },
                { icon: BarChart3,  label: 'Score Tracking'         },
                { icon: ListChecks, label: 'Detailed Explanations'  },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-4 py-2 text-sm text-muted">
                    <Icon className="h-3.5 w-3.5 text-violet" aria-hidden="true" />
                    {f.label}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Config form */}
        <section className="relative section-block-sm">
          <div className="page-container max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-bg-elevated/60 p-5 shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8 md:p-10">
                <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" aria-hidden="true" />

                {/* Topic input */}
                <div className="mb-10">
                  <label className="mb-3 block font-display text-lg font-bold text-white">
                    What do you want to be tested on?
                  </label>
                  <Input
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generate()}
                    placeholder="e.g. Binary Search Trees, Thermodynamics, World War II..."
                    size="lg"
                    hint="Be specific for better questions — e.g. 'Sorting algorithms in C++' instead of just 'Programming'"
                  />
                </div>

                {/* Difficulty */}
                <div className="mb-10">
                  <label className="mb-4 block font-display text-lg font-bold text-white">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Difficulty level">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        role="radio"
                        aria-checked={difficulty === d}
                        className={cn(
                          'group flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50',
                          difficulty === d
                            ? cn(diffConfig[d].active, diffConfig[d].glow)
                            : 'border-white/[0.07] bg-white/[0.02] text-muted hover:border-white/[0.12] hover:bg-white/[0.04]',
                        )}
                      >
                        <span className="text-2xl">{diffConfig[d].icon}</span>
                        <div>
                          <div className="font-display text-sm font-bold">{d}</div>
                          <div className={cn('mt-0.5 text-xs leading-relaxed', difficulty === d ? 'opacity-80' : 'text-muted/60')}>
                            {diffConfig[d].desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question count */}
                <div className="mb-10">
                  <label className="mb-4 block font-display text-lg font-bold text-white">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {QUESTION_COUNTS.map(n => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        aria-pressed={count === n}
                        className={cn(
                          'rounded-xl border py-4 text-center font-display text-xl font-black transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50 sm:text-2xl',
                          count === n
                            ? 'border-cyan/30 bg-cyan/[0.08] text-cyan shadow-[0_0_20px_rgba(56,217,245,0.08)]'
                            : 'border-white/[0.07] bg-white/[0.02] text-muted hover:border-white/[0.12] hover:text-foreground',
                        )}
                      >
                        {n}
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                          {n === 3 ? 'Quick' : n === 5 ? 'Standard' : 'Full test'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated time */}
                <div className="mb-8 flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-muted">
                  <Clock className="h-4 w-4 text-muted/60" aria-hidden="true" />
                  Estimated time: <span className="font-semibold text-foreground">{count * 2}–{count * 3} minutes</span>
                  <span className="mx-2 text-white/10">·</span>
                  Powered by Llama 3.3 70B via Groq
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-3 rounded-xl border border-pink/20 bg-pink/[0.05] px-5 py-4 text-sm text-pink"
                    role="alert"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <Button
                  onClick={generate}
                  disabled={!topic.trim()}
                  variant="gradient"
                  size="xl"
                  className="w-full justify-center text-base font-bold"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Quiz
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
        <div className="pointer-events-none fixed inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/[0.05] blur-[140px]" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-8 font-display text-2xl font-bold text-white">Generating your quiz…</h2>
          <p className="mt-3 max-w-sm text-base text-muted">
            Creating {count} {difficulty.toLowerCase()} questions on<br />
            <span className="font-semibold text-white">"{topic}"</span>
          </p>
          <p className="mt-3 text-sm text-muted/50">Usually takes 5–10 seconds</p>
        </motion.div>
      </div>
    );
  }

  // ── RESULTS SCREEN ────────────────────────────────────────────────────────────
  if (submitted) {
    const correctCount = answers.filter((a, i) => a === questions[i]?.ans).length;
    return (
      <div className="min-h-screen bg-bg text-foreground">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/[0.06] blur-[140px]" />
        </div>

        {/* Results hero */}
        <section className={cn('relative border-b border-white/[0.05] bg-gradient-to-b to-transparent section-block-sm text-center', scoreLabel.bg)}>
          <div className="page-container max-w-3xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="violet" className="mb-7">Quiz Complete</Badge>
              <div className="mb-8 flex justify-center">
                <ScoreRing pct={pct} />
              </div>
              <h1 className={cn('font-display text-4xl font-black text-white md:text-5xl mb-3', scoreLabel.color)}>
                {scoreLabel.text}
              </h1>
              <p className="text-lg text-muted">{scoreLabel.sub}</p>

              {/* Score breakdown */}
              <div className={cn('mt-8 inline-flex items-center gap-3 rounded-2xl border px-8 py-5', scoreLabel.border, scoreLabel.bg)}>
                <div className="text-center">
                  <div className="font-display text-3xl font-black text-white">{correctCount}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted">Correct</div>
                </div>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div className="text-center">
                  <div className="font-display text-3xl font-black text-white">{questions.length - correctCount}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted">Incorrect</div>
                </div>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div className="text-center">
                  <div className="font-display text-3xl font-black text-white">{questions.length}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted">Total</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button onClick={resetQuiz} variant="gradient" size="lg">
                  <RotateCcw className="h-4 w-4" />
                  New Quiz
                </Button>
                <Button onClick={() => setSubmitted(false)} variant="secondary" size="lg">
                  Review Answers
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Performance breakdown */}
        <section className="section-block-sm">
          <div className="page-container max-w-3xl">
            <h2 className="mb-8 font-display text-2xl font-bold text-white">Answer Review</h2>
            <div className="space-y-5">
              {questions.map((q, qi) => {
                const chosen = answers[qi];
                const isCorrect = chosen === q.ans;
                return (
                  <motion.div
                    key={qi}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qi * 0.05 }}
                    className={cn(
                      'overflow-hidden rounded-2xl border',
                      isCorrect ? 'border-green/20' : 'border-pink/20',
                    )}
                  >
                    {/* Question */}
                    <div className={cn(
                      'flex items-start gap-4 border-b px-6 py-5',
                      isCorrect ? 'border-green/10 bg-green/[0.03]' : 'border-pink/10 bg-pink/[0.03]',
                    )}>
                      {isCorrect
                        ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green" aria-hidden="true" />
                        : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-pink" aria-hidden="true" />
                      }
                      <div className="flex-1">
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted/50">Question {qi + 1}</div>
                        <p className="font-semibold leading-relaxed text-white">{q.q}</p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 px-6 py-5">
                      {q.options.map((opt, oi) => {
                        const isCorrectOpt = oi === q.ans;
                        const isChosenOpt  = oi === chosen;
                        return (
                          <div
                            key={oi}
                            className={cn(
                              'flex items-center gap-3 rounded-xl border px-5 py-3.5 text-sm',
                              isCorrectOpt
                                ? 'border-green/25 bg-green/[0.06] text-green font-semibold'
                                : isChosenOpt && !isCorrectOpt
                                ? 'border-pink/25 bg-pink/[0.05] text-pink/70 line-through'
                                : 'border-white/[0.04] text-muted/40',
                            )}
                          >
                            <span className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-black',
                              isCorrectOpt ? 'border-green/30 bg-green/10 text-green'
                              : isChosenOpt ? 'border-pink/30 bg-pink/10 text-pink'
                              : 'border-white/[0.06] text-muted/30',
                            )}>
                              {LETTERS[oi]}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectOpt && <CheckCircle2 className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mx-5 mb-5 rounded-xl border border-violet/15 bg-violet/[0.04] px-5 py-4">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-violet/70">Explanation</p>
                        <p className="text-sm leading-relaxed text-foreground/80">{q.explanation}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center">
              <Button onClick={resetQuiz} variant="gradient" size="xl">
                <RotateCcw className="h-5 w-5" />
                Take Another Quiz
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── QUESTIONS SCREEN ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg text-foreground">
      {/* Sticky progress header */}
      <div className="sticky top-16 z-20 border-b border-white/[0.05] bg-bg/90 backdrop-blur-xl">
        <div className="page-container max-w-4xl py-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-white">{topic}</h2>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                <span className={cn(
                  'rounded-full border px-2.5 py-0.5 font-bold uppercase tracking-wide',
                  diffConfig[difficulty].active,
                )}>
                  {difficulty}
                </span>
                <span>{answeredCount} of {questions.length} answered</span>
              </div>
            </div>
            <button
              onClick={resetQuiz}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-cyan/50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Start over
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
              initial={{ width: 0 }}
              animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="page-container max-w-4xl py-8 sm:py-12">
        <div className="space-y-8">
          {questions.map((q, qi) => {
            const chosen   = answers[qi];
            const hasAnswer = chosen !== -1;

            return (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.07 }}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-300',
                  hasAnswer ? 'border-white/[0.09]' : 'border-white/[0.05]',
                )}
              >
                {/* Question header */}
                <div className="flex items-start gap-4 border-b border-white/[0.05] bg-bg-elevated/40 px-5 py-5 sm:gap-5 sm:px-8 sm:py-7">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] font-mono text-sm font-black text-muted">
                    {qi + 1}
                  </span>
                  <p className="pt-1 text-base font-semibold leading-relaxed text-white sm:text-lg">{q.q}</p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3 bg-bg/60 p-4 sm:grid-cols-2 sm:p-6">
                  {q.options.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => choose(qi, oi)}
                        disabled={hasAnswer}
                        aria-pressed={isChosen}
                        className={cn(
                          'group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200',
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50',
                          hasAnswer
                            ? isChosen
                              ? 'border-cyan/25 bg-cyan/[0.06] text-white cursor-default shadow-[0_0_20px_rgba(56,217,245,0.05)]'
                              : 'border-white/[0.04] bg-white/[0.01] text-muted/40 cursor-default'
                            : 'border-white/[0.07] bg-bg-elevated/40 text-foreground hover:border-cyan/25 hover:bg-cyan/[0.03] hover:text-white cursor-pointer active:scale-[0.99]',
                        )}
                      >
                        <span className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-all duration-200',
                          hasAnswer && isChosen ? 'border-cyan/30 bg-cyan/10 text-cyan'
                          : hasAnswer ? 'border-white/[0.05] text-muted/30'
                          : 'border-white/[0.08] text-muted/60 group-hover:border-cyan/20 group-hover:text-cyan/80',
                        )}>
                          {LETTERS[oi]}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {!hasAnswer && (
                  <div className="border-t border-white/[0.04] bg-bg/40 px-8 py-3">
                    <p className="text-[11px] text-muted/40">Select an answer above to continue</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Submit row */}
        <div className="mt-10 flex flex-col items-stretch justify-between gap-4 rounded-xl border border-white/[0.05] bg-bg-elevated/30 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="text-sm text-muted">
            {allAnswered
              ? <span className="font-semibold text-green">All questions answered — ready to submit!</span>
              : <span>{questions.length - answeredCount} question{questions.length - answeredCount !== 1 ? 's' : ''} remaining</span>
            }
          </div>
          <Button
            onClick={submitQuiz}
            disabled={!allAnswered}
            variant="gradient"
            size="lg"
          >
            <CheckCircle2 className="h-5 w-5" />
            Submit Quiz
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
