import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuth } from './AuthContext';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import {
  MessageSquare, Zap, BookOpen, ArrowRight,
  CheckCircle, Star, Sparkles, Brain, GraduationCap, ChevronRight,
} from 'lucide-react';

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const steps = 60;
    const increment = to / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, 20);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { val: 12000, suffix: '+', label: 'Questions Answered'  },
  { val: 4800,  suffix: '+', label: 'Quizzes Generated'    },
  { val: 2200,  suffix: '+', label: 'Study Guides Created' },
  { val: 98,    suffix: '%', label: 'Satisfaction Rate'    },
];

const TESTIMONIALS = [
  { quote: "CampusGPT completely changed how I study for exams. The quiz generator nails exactly what I need to practice.", name: "Sara K.",    role: "Computer Science, 3rd Year",    initial: "S", rating: 5, accent: 'border-cyan/15 from-cyan/[0.04]'   },
  { quote: "I used the study guide feature before my data structures final. Having a day-by-day plan made everything feel manageable.", name: "Ahmed R.",   role: "Software Engineering, 2nd Year", initial: "A", rating: 5, accent: 'border-violet/15 from-violet/[0.04]' },
  { quote: "The AI explains things better than half my professors. It actually adapts to how I ask questions.", name: "Zainab M.", role: "Mathematics, 4th Year",           initial: "Z", rating: 5, accent: 'border-green/15 from-green/[0.04]'   },
];

const STEPS = [
  { num: '01', title: 'Create your account', desc: 'Sign up for free in under 30 seconds. No credit card required.',         icon: GraduationCap, color: 'text-cyan',     bg: 'border-cyan/15   bg-cyan/[0.04]'    },
  { num: '02', title: 'Choose a tool',       desc: 'Pick from AI Chat, Quiz Generator, or Study Guide builder.',                  icon: Zap,          color: 'text-violet', bg: 'border-violet/15 bg-violet/[0.04]'  },
  { num: '03', title: 'Enter your topic',     desc: 'Type any subject — from calculus to computer networks.',                      icon: Sparkles,      color: 'text-pink',   bg: 'border-pink/15   bg-pink/[0.04]'    },
  { num: '04', title: 'Learn and track',      desc: 'Study with AI, take quizzes, complete tasks, and grow.',                      icon: CheckCircle,   color: 'text-green',  bg: 'border-green/15  bg-green/[0.04]'   },
];

// ── Mock UI panels ─────────────────────────────────────────────────────────────
function MockChatPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-elevated/80 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-bg-subtle/60 px-4 py-3">
        <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-white/10" /><div className="h-2.5 w-2.5 rounded-full bg-white/10" /><div className="h-2.5 w-2.5 rounded-full bg-white/10" /></div>
        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted/50">AI Chat</span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex justify-end"><div className="max-w-[72%] rounded-xl rounded-tr-sm border border-cyan/10 bg-cyan/[0.05] px-4 py-2.5 text-sm text-white">Explain Big O notation with examples</div></div>
        <div className="flex gap-3">
          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-bg-subtle text-[9px] font-black text-cyan">AI</div>
          <div className="max-w-[80%] rounded-xl rounded-tl-sm border border-white/[0.06] bg-bg-subtle/60 px-4 py-2.5 text-sm text-foreground/90">
            <span className="font-semibold text-white">Big O notation</span> describes how an algorithm's complexity grows. Common: <code className="rounded bg-cyan/[0.08] px-1 text-cyan text-xs">O(1)</code>, <code className="rounded bg-cyan/[0.08] px-1 text-cyan text-xs">O(n)</code>, <code className="rounded bg-cyan/[0.08] px-1 text-cyan text-xs">O(n²)</code>
          </div>
        </div>
        <div className="flex justify-end"><div className="max-w-[72%] rounded-xl rounded-tr-sm border border-cyan/10 bg-cyan/[0.05] px-4 py-2.5 text-sm text-white">What's an example of O(n log n)?</div></div>
        <div className="flex gap-3">
          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-bg-subtle text-[9px] font-black text-cyan">AI</div>
          <div className="max-w-[80%] rounded-xl rounded-tl-sm border border-white/[0.06] bg-bg-subtle/60 px-4 py-2.5 text-sm text-foreground/90">
            <span className="font-semibold text-white">Merge sort</span> — it divides in half recursively, then merges. Classic <code className="rounded bg-cyan/[0.08] px-1 text-cyan text-xs">O(n log n)</code> algorithm.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mock Quiz Panel ────────────────────────────────────────────────────────────
function MockQuizPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-elevated/80 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-bg-subtle/60 px-4 py-3">
        <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-white/10" /><div className="h-2.5 w-2.5 rounded-full bg-white/10" /><div className="h-2.5 w-2.5 rounded-full bg-white/10" /></div>
        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted/50">Quiz Engine</span>
        <span className="ml-auto rounded-full border border-violet/20 bg-violet/[0.08] px-2 py-0.5 text-[10px] font-bold text-violet">2 / 5</span>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm font-semibold text-white">What is the time complexity of binary search?</p>
        <div className="space-y-2">
          {[{ l: 'A.  O(n)', c: false }, { l: 'B.  O(log n)', c: true }, { l: 'C.  O(n²)', c: false }, { l: 'D.  O(1)', c: false }].map(opt => (
            <div key={opt.l} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${opt.c ? 'border-green/30 bg-green/[0.06] text-green' : 'border-white/[0.06] bg-white/[0.01] text-muted/50'}`}>
              <span>{opt.l}</span>
              {opt.c && <CheckCircle className="ml-auto h-3.5 w-3.5 text-green" />}
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-green/15 bg-green/[0.04] px-4 py-3 text-xs text-green/90">
          ✓ Correct! Binary search halves the search space — <strong>O(log n)</strong>.
        </div>
      </div>
    </div>
  );
}

// ── Mock Guide Panel ───────────────────────────────────────────────────────────
function MockGuidePanel() {
  const days = [
    { day: 'Day 1', title: 'Introduction & Fundamentals', done: true },
    { day: 'Day 2', title: 'Core Concepts & Examples',     done: true },
    { day: 'Day 3', title: 'Practice Problems',             done: false, active: true },
    { day: 'Day 4', title: 'Advanced Topics',              done: false },
    { day: 'Day 5', title: 'Review & Mock Test',          done: false },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-elevated/80 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-bg-subtle/60 px-4 py-3">
        <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-white/10" /><div className="h-2.5 w-2.5 rounded-full bg-white/10" /><div className="h-2.5 w-2.5 rounded-full bg-white/10" /></div>
        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted/50">Study Guide</span>
        <span className="ml-auto rounded-full border border-green/20 bg-green/[0.08] px-2 py-0.5 text-[10px] font-bold text-green">2 / 5 days</span>
      </div>
      <div className="space-y-2 p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted/60">Data Structures — 5-Day Plan</p>
        {days.map(d => (
          <div key={d.day} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${d.done ? 'border-green/20 bg-green/[0.04]' : d.active ? 'border-cyan/25 bg-cyan/[0.05]' : 'border-white/[0.05] bg-white/[0.01]'}`}>
            <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${d.done ? 'border-green bg-green/20' : d.active ? 'border-cyan bg-cyan/20' : 'border-white/20'}`}>
              {d.done && <CheckCircle className="h-2.5 w-2.5 text-green" />}
              {d.active && <div className="h-1.5 w-1.5 rounded-full bg-cyan" />}
            </div>
            <span className="text-[11px] font-bold text-muted/70 w-10 shrink-0">{d.day}</span>
            <span className={`text-sm ${d.done ? 'text-green/80' : d.active ? 'text-white' : 'text-muted/50'}`}>{d.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-bg text-foreground">

      <section className="hero-block relative w-full overflow-hidden border-b border-white/[0.05] text-center">
        
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute left-[15%] top-[20%] h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/[0.07] blur-[140px]" />
          <div className="absolute right-[10%] top-[30%] h-[500px] w-[500px] rounded-full bg-cyan/[0.06] blur-[140px]" />
          <div className="absolute bottom-[-5%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-pink/[0.05] blur-[140px]" />
        </div>

        <div className="page-container relative z-20 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="cyan" className="mb-6">AI-powered learning platform</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-balance mx-auto max-w-4xl text-center font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Your AI study partner
            <br />
            <span className="grad-text">for every subject.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted sm:text-lg"
          >
            CampusGPT combines real-time AI chat, custom quiz generation, and personalized study roadmaps
            into one platform. Built for students who want to study smarter, not harder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {user ? (
              <>
                <Button to="/dashboard" variant="gradient" size="lg"><Zap className="h-4 w-4" />Go to Dashboard</Button>
                <Button to="/chat" variant="secondary" size="lg">Open AI Chat<ArrowRight className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Button to="/register" variant="gradient" size="lg">Get Started Free<ArrowRight className="h-4 w-4" /></Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} variant="secondary" size="lg">See how it works</Button>
              </>
            )}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.44 }} className="mt-6 text-sm font-medium text-muted/70 text-center">
            ✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Works for any subject
          </motion.p>
        </div>

        {/* Product mockup display tracking panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="relative z-10 mt-12 w-full max-w-4xl sm:mt-14"
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-violet/[0.05] to-cyan/[0.03] blur-2xl" />
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-bg-elevated/80 shadow-[0_48px_120px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            {/* Chrome Header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-bg-subtle/80 px-5 py-3.5">
              <div className="flex gap-2"><div className="h-3 w-3 rounded-full bg-white/[0.08]" /><div className="h-3 w-3 rounded-full bg-white/[0.08]" /><div className="h-3 w-3 rounded-full bg-white/[0.08]" /></div>
              <div className="mx-auto flex items-center gap-2 rounded-lg border border-white/[0.06] bg-bg/60 px-4 py-1">
                <span className="h-2 w-2 rounded-full bg-green/60 animate-pulse" />
                <span className="text-[11px] text-muted/60 tracking-wide">campusgpt.app / chat</span>
              </div>
            </div>
            {/* Mock Layout Grid */}
            <div className="flex h-auto min-h-[380px] md:min-h-[460px]">
              <div className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/[0.05] bg-bg-subtle/40 p-4">
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-cyan/20 bg-cyan/[0.06] px-3 py-2.5 text-xs font-bold text-cyan">
                  <span className="text-base leading-none">+</span>New Chat
                </div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted/40">Recent</p>
                <div className="space-y-1">
                  {['Big O Notation & Time Co...', 'Explain recursion with tree...', 'Linked lists vs arrays diff...'].map((t, i) => (
                    <div key={i} className={`truncate rounded-lg px-3 py-2 text-xs text-muted/70 ${i === 0 ? 'bg-white/[0.04] text-foreground/80' : ''}`}>{t}</div>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 flex-col text-left">
                <div className="flex-1 space-y-4 overflow-hidden p-6">
                  <div className="flex justify-end"><div className="max-w-[65%] rounded-xl rounded-tr-sm border border-cyan/10 bg-cyan/[0.05] px-4 py-3 text-sm text-white">Explain Big O notation with a real code example</div></div>
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-bg-subtle text-[9px] font-black text-cyan">AI</div>
                    <div className="max-w-[80%] rounded-xl rounded-tl-sm border border-white/[0.06] bg-bg-subtle/60 px-4 py-3 text-sm text-foreground/90">
                      <span className="font-semibold text-white">Big O notation</span> describes the upper bound of an algorithm's complexity. A linear search is <code className="rounded bg-cyan/[0.1] px-1 text-cyan text-xs border border-cyan/10">O(n)</code> — each element is visited once.
                    </div>
                  </div>
                  <div className="flex justify-end"><div className="max-w-[65%] rounded-xl rounded-tr-sm border border-cyan/10 bg-cyan/[0.05] px-4 py-3 text-sm text-white">What about binary search?</div></div>
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-bg-subtle text-[9px] font-black text-cyan">AI</div>
                    <div className="max-w-[80%] rounded-xl rounded-tl-sm border border-white/[0.06] bg-bg-subtle/60 px-4 py-3 text-sm text-foreground/90">
                      Binary search is <code className="rounded bg-cyan/[0.1] px-1 text-cyan text-xs border border-cyan/10">O(log n)</code> — it halves the search space each step. <strong className="text-white">Much faster</strong> for sorted data.<span className="cursor-blink ml-1" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/[0.05] bg-bg/60 p-4">
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-bg-subtle/60 px-4 py-3">
                    <span className="flex-1 text-sm text-muted/40">Ask anything about your coursework...</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-cyan to-violet">
                      <ArrowRight className="h-3.5 w-3.5 text-black" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ SECTION 2 — STATS ══ */}
      <section className="border-b border-white/[0.05] bg-bg-elevated/30 py-10">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="text-center">
                <div className="font-display text-4xl font-extrabold text-white"><Counter to={s.val} suffix={s.suffix} /></div>
                <div className="mt-1.5 text-sm font-medium text-muted">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 3 — FEATURES ══ */}
      <section id="features" className="py-16 md:py-24 text-left">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <Badge variant="violet" className="mb-4">Features</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl text-center">
              Three tools.{' '}<span className="grad-text">One platform.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted text-center">
              Everything you need to master any subject — chat, quiz, and plan your way to better grades.
            </p>
          </motion.div>

          {/* Feature 1 */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className="mb-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/[0.07]"><MessageSquare className="h-7 w-7 text-cyan" /></div>
              <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-white">AI Chat Assistant</h3>
              <p className="mb-5 text-base leading-relaxed text-muted">Ask anything about your coursework and get clear, contextual explanations powered by Llama 3.3 70B. Multi-turn memory keeps context across your entire conversation.</p>
              <ul className="mb-6 space-y-2.5">
                {['Real-time streaming responses', 'Multi-turn conversation memory', 'Supports any subject or topic'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground/80"><ChevronRight className="h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <Link to={user ? '/chat' : '/register'} className="inline-flex items-center gap-2 text-sm font-bold text-cyan transition-colors hover:text-white">Start chatting <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="relative"><div className="pointer-events-none absolute -inset-4 rounded-3xl bg-cyan/[0.04] blur-2xl" aria-hidden="true" /><MockChatPanel /></div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className="mb-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1"><div className="pointer-events-none absolute -inset-4 rounded-3xl bg-violet/[0.04] blur-2xl" aria-hidden="true" /><MockQuizPanel /></div>
            <div className="order-1 lg:order-2">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet/20 bg-violet/[0.07]"><Brain className="h-7 w-7 text-violet" /></div>
              <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-white">Quiz Generator</h3>
              <p className="mb-5 text-base leading-relaxed text-muted">Generate custom multiple-choice quizzes on any topic with instant feedback, detailed explanations, and performance tracking across all your sessions.</p>
              <ul className="mb-6 space-y-2.5">
                {['Customizable difficulty & count', 'Instant answer explanations', 'Score history & performance tracking'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground/80"><ChevronRight className="h-4 w-4 shrink-0 text-violet" aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <Link to={user ? '/quiz' : '/register'} className="inline-flex items-center gap-2 text-sm font-bold text-violet transition-colors hover:text-white">Take a quiz <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-green/20 bg-green/[0.07]"><BookOpen className="h-7 w-7 text-green" /></div>
              <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-white">Study Roadmaps</h3>
              <p className="mb-5 text-base leading-relaxed text-muted">Get structured day-by-day learning plans with tasks, curated resources, and interactive progress tracking. Your personalized curriculum, generated in seconds.</p>
              <ul className="mb-6 space-y-2.5">
                {['Day-by-day structured plans', 'Interactive progress checkboxes', 'Curated resources per topic'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground/80"><ChevronRight className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <Link to={user ? '/guide' : '/register'} className="inline-flex items-center gap-2 text-sm font-bold text-green transition-colors hover:text-white">Create a guide <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="relative"><div className="pointer-events-none absolute -inset-4 rounded-3xl bg-green/[0.03] blur-2xl" aria-hidden="true" /><MockGuidePanel /></div>
          </motion.div>
        </div>
      </section>

      {/* ══ SECTION 4 — HOW IT WORKS ══ */}
      <section id="how-it-works" className="border-y border-white/[0.05] bg-bg-elevated/20 py-16 md:py-24">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <Badge variant="green" className="mb-4">How it works</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Up and running <span className="grad-text">in minutes</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted">From zero to studying with AI in four simple steps.</p>
          </motion.div>

          <div className="relative">
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-11 hidden h-px lg:block" aria-hidden="true" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)' }} />
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative flex flex-col items-center text-center">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 select-none font-display text-8xl font-black leading-none text-white/[0.03]">{step.num}</span>
                    <div className={`relative z-10 mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border ${step.bg} shadow-soft`}>
                      <Icon className={`h-7 w-7 ${step.color}`} aria-hidden="true" />
                    </div>
                    <h3 className="mb-3 font-display text-lg font-bold text-white">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 5 — TESTIMONIALS ══ */}
      <section className="py-16 md:py-24 text-left">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <Badge variant="amber" className="mb-4">Student voices</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">Trusted by students everywhere</h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted">Real feedback from students using CampusGPT to ace their courses.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`flex min-h-[220px] flex-col rounded-2xl border ${t.accent} bg-gradient-to-br to-transparent bg-bg-elevated/50 p-8 backdrop-blur-sm`}>
                <div className="mb-5 flex gap-1" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, s) => <Star key={s} className="h-4 w-4 fill-amber text-amber" aria-hidden="true" />)}
                </div>
                <p className="mb-6 flex-1 text-lg leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-violet/20 to-cyan/10 text-sm font-bold text-white" aria-hidden="true">{t.initial}</div>
                  <div><div className="text-sm font-bold text-white">{t.name}</div><div className="text-xs text-muted">{t.role}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 6 — CTA ══ */}
      <section className="relative overflow-hidden border-t border-white/[0.05] py-20 md:py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/[0.08] blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.05] blur-[100px]" />
        </div>
        <div className="page-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Badge variant="pink" className="mb-6">Get started today</Badge>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Start learning smarter today.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base text-muted">
              Join thousands of students already using CampusGPT to understand harder topics, score higher, and study less.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Button to="/dashboard" variant="gradient" size="lg">Open Dashboard<ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <>
                  <Button to="/register" variant="gradient" size="lg">Get Started Free<ArrowRight className="h-4 w-4" /></Button>
                  <Button to="/about" variant="secondary" size="lg">Learn more</Button>
                </>
              )}
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <span className="mr-2 text-[11px] font-bold uppercase tracking-widest text-muted/40">Built with</span>
              {['React', 'Node.js', 'MongoDB', 'Groq AI', 'TypeScript'].map(tech => (
                <span key={tech} className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs font-semibold text-muted/60">{tech}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
