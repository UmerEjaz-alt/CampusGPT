import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sliders, Calendar, Sparkles, Plus, Check,
  CheckCircle2, Layers, Clock, Bookmark, FolderGit2,
  ArrowRight, Target, Zap, GraduationCap, ChevronDown, ChevronUp,
} from 'lucide-react';
import api from './api';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import Input from './components/ui/Input';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { cn } from './components/ui/cn';

interface Task { text: string; completed: boolean; }
interface Step { day: string; title: string; desc: string; tasks: Task[]; resources: string[]; }
interface Guide {
  _id: string;
  topic: string;
  level: string;
  duration: string;
  overview: { days: number; hours: number; topics: number; projects: number };
  steps: Step[];
  progress: number;
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const DURATIONS = ['1 Week', '2 Weeks', '1 Month'] as const;

const levelConfig: Record<typeof LEVELS[number], { icon: string; color: string; active: string; desc: string }> = {
  Beginner:     { icon: '🌱', color: 'text-green',  active: 'border-green/30 bg-green/[0.07] text-green',   desc: 'New to the topic'           },
  Intermediate: { icon: '⚡', color: 'text-amber',  active: 'border-amber/30 bg-amber/[0.07] text-amber',   desc: 'Some prior experience'      },
  Advanced:     { icon: '🔥', color: 'text-pink',   active: 'border-pink/30  bg-pink/[0.07]  text-pink',    desc: 'Deep dive & mastery'        },
};

const durationConfig: Record<typeof DURATIONS[number], { icon: string; sub: string }> = {
  '1 Week':  { icon: '⚡', sub: '7 days · Quick immersion'         },
  '2 Weeks': { icon: '📚', sub: '14 days · Thorough coverage'      },
  '1 Month': { icon: '🎓', sub: '30 days · Complete mastery path'  },
};

export default function Roadmap() {
  const [topic,    setTopic]    = useState('');
  const [level,    setLevel]    = useState<typeof LEVELS[number]>('Beginner');
  const [duration, setDuration] = useState<typeof DURATIONS[number]>('1 Week');
  const [guide,    setGuide]    = useState<Guide | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [expanded, setExpanded] = useState<number | null>(0);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setGuide(null); setExpanded(0);
    try {
      const { data } = await api.post('/api/guide/generate', { topic, level, duration });
      setGuide(data.guide);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate guide. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (stepIdx: number, taskIdx: number) => {
    if (!guide) return;
    const next = {
      ...guide,
      steps: guide.steps.map((s, si) =>
        si !== stepIdx ? s : {
          ...s,
          tasks: s.tasks.map((t, ti) =>
            ti !== taskIdx ? t : { ...t, completed: !t.completed },
          ),
        },
      ),
    };
    const all = next.steps.flatMap(s => s.tasks);
    next.progress = all.length ? Math.round(all.filter(t => t.completed).length / all.length * 100) : 0;
    setGuide(next);
    try {
      await api.put('/api/user/guides/task', {
        guideId: guide._id, stepIndex: stepIdx, taskIndex: taskIdx,
        completed: next.steps[stepIdx].tasks[taskIdx].completed,
      });
    } catch { /* silent */ }
  };

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────────
  if (!guide && !loading) {
    return (
      <div className="min-h-screen bg-bg text-foreground">
        {/* Ambient */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute right-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-cyan/[0.04] blur-[140px]" />
          <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-violet/[0.04] blur-[120px]" />
        </div>

        {/* Hero header */}
        <section className="relative border-b border-white/[0.05] section-block-sm text-center">
          <div className="page-container max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="green" className="mb-7">Study Guide Builder</Badge>
              <h1 className="text-balance font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Build your perfect
                <br />
                <span className="grad-text-green">learning roadmap.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                Get a structured, day-by-day study plan tailored to your topic, skill level, and available time. Complete tasks, track progress, and build real understanding.
              </p>
            </motion.div>

            {/* What you get */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-10 grid grid-cols-2 gap-3 text-left md:grid-cols-4"
            >
              {[
                { icon: Calendar,      label: 'Day-by-day plan',         color: 'text-cyan'   },
                { icon: CheckCircle2,  label: 'Interactive tasks',        color: 'text-green'  },
                { icon: Bookmark,      label: 'Curated resources',        color: 'text-violet' },
                { icon: Target,        label: 'Progress tracking',        color: 'text-pink'   },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <Icon className={cn('h-5 w-5 shrink-0', f.color)} aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground/80">{f.label}</span>
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
                <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-green/30 to-transparent" aria-hidden="true" />

                {/* Topic */}
                <div className="mb-10">
                  <label className="mb-3 block font-display text-lg font-bold text-white">
                    What do you want to learn?
                  </label>
                  <div className="relative">
                    <Input
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generate()}
                      placeholder="e.g. Relational Databases, Linear Algebra, React.js..."
                      size="lg"
                      hint="Try to be specific for more focused results"
                    />
                    <BookOpen className="pointer-events-none absolute right-4 top-[1rem] h-4 w-4 text-muted/30" aria-hidden="true" />
                  </div>
                </div>

                {/* Skill level */}
                <div className="mb-10">
                  <label className="mb-4 block font-display text-lg font-bold text-white">
                    Your Skill Level
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Skill level">
                    {LEVELS.map(l => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        role="radio"
                        aria-checked={level === l}
                        className={cn(
                          'group flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50',
                          level === l
                            ? levelConfig[l].active
                            : 'border-white/[0.07] bg-white/[0.02] text-muted hover:border-white/[0.12] hover:bg-white/[0.04]',
                        )}
                      >
                        <span className="text-2xl">{levelConfig[l].icon}</span>
                        <div>
                          <div className="font-display text-sm font-bold">{l}</div>
                          <div className={cn('mt-0.5 text-xs', level === l ? 'opacity-80' : 'text-muted/60')}>
                            {levelConfig[l].desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-10">
                  <label className="mb-4 block font-display text-lg font-bold text-white">
                    Study Duration
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Study duration">
                    {DURATIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        role="radio"
                        aria-checked={duration === d}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-2xl border p-5 text-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50',
                          duration === d
                            ? 'border-cyan/30 bg-cyan/[0.07] text-cyan shadow-[0_0_20px_rgba(56,217,245,0.07)]'
                            : 'border-white/[0.07] bg-white/[0.02] text-muted hover:border-white/[0.12] hover:bg-white/[0.04]',
                        )}
                      >
                        <span className="text-2xl">{durationConfig[d].icon}</span>
                        <div className="font-display text-sm font-bold">{d}</div>
                        <div className={cn('text-[11px]', duration === d ? 'opacity-70' : 'text-muted/50')}>
                          {durationConfig[d].sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-pink/20 bg-pink/[0.05] px-5 py-4 text-sm text-pink" role="alert">
                    {error}
                  </div>
                )}

                <Button
                  onClick={generate}
                  disabled={!topic.trim()}
                  variant="gradient"
                  size="xl"
                  className="w-full justify-center text-base font-bold"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Study Guide
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
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.05] blur-[140px]" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-8 font-display text-2xl font-bold text-white">Assembling your roadmap…</h2>
          <p className="mt-3 max-w-sm text-base text-muted">
            Building a <span className="font-semibold text-white">{duration}</span> {level.toLowerCase()} guide for<br />
            <span className="font-semibold text-white">"{topic}"</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // ── GUIDE DISPLAY ─────────────────────────────────────────────────────────────
  if (!guide) return null;

  const completedSteps = guide.steps.filter(s => s.tasks.length > 0 && s.tasks.every(t => t.completed)).length;

  return (
    <div className="min-h-screen bg-bg text-foreground">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan/[0.03] blur-[130px]" />
        <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-violet/[0.03] blur-[120px]" />
      </div>

      {/* Guide header */}
      <section className="relative border-b border-white/[0.05] py-10 sm:py-14">
        <div className="page-container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="green">Study Guide</Badge>
                  <span className="rounded-lg border border-cyan/20 bg-cyan/[0.06] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan">
                    {guide.level}
                  </span>
                  <span className="text-xs font-semibold text-muted">{guide.duration}</span>
                </div>
                <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">{guide.topic}</h1>
              </div>
              <Button
                onClick={() => { setGuide(null); setTopic(''); }}
                variant="secondary"
                size="md"
                className="shrink-0 gap-2"
              >
                <Plus className="h-4 w-4 text-cyan" aria-hidden="true" />
                New Guide
              </Button>
            </div>

            {/* Overview stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { val: guide.overview?.days ?? '—',     label: 'Days',        icon: Calendar,   color: 'text-cyan'   },
                { val: `${guide.overview?.hours ?? '—'}h`, label: 'Study Time',  icon: Clock,      color: 'text-violet' },
                { val: guide.overview?.topics ?? '—',   label: 'Topics',      icon: Layers,     color: 'text-green'  },
                { val: guide.overview?.projects ?? '—', label: 'Projects',    icon: FolderGit2, color: 'text-pink'   },
              ].map(({ val, label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-bg-elevated/40 p-4">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]', color)}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className={cn('font-display text-xl font-bold', color)}>{val}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-bg-elevated/30 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-muted">
                  <CheckCircle2 className="h-4 w-4 text-cyan" aria-hidden="true" />
                  Overall Progress
                </span>
                <span className="font-mono font-black text-white">{guide.progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan via-violet to-pink"
                  initial={{ width: 0 }}
                  animate={{ width: `${guide.progress}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{ boxShadow: '0 0 16px rgba(56,217,245,0.3)' }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted/50">
                <span>{completedSteps} of {guide.steps.length} days completed</span>
                {guide.progress === 100 && (
                  <span className="font-bold text-green">🎉 Complete!</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative section-block-sm">
        <div className="page-container max-w-5xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-cyan/20 via-white/[0.05] to-transparent hidden md:block" aria-hidden="true" />

            <div className="space-y-5">
              {guide.steps.map((step, si) => {
                const stepDone = step.tasks.length > 0 && step.tasks.every(t => t.completed);
                const stepPart = step.tasks.some(t => t.completed);
                const isExpanded = expanded === si;

                return (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: si * 0.05 }}
                    className="relative md:pl-14"
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'absolute left-0 top-6 hidden md:flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                        stepDone
                          ? 'border-green bg-green/10 shadow-[0_0_16px_rgba(79,255,176,0.2)]'
                          : stepPart
                          ? 'border-cyan bg-cyan/10'
                          : 'border-white/15 bg-bg',
                      )}
                      aria-hidden="true"
                    >
                      {stepDone
                        ? <Check className="h-4 w-4 text-green stroke-[2.5]" />
                        : <div className={cn('h-2 w-2 rounded-full', stepPart ? 'bg-cyan' : 'bg-white/20')} />
                      }
                    </div>

                    {/* Step card */}
                    <div className={cn(
                      'overflow-hidden rounded-2xl border transition-all duration-300',
                      stepDone ? 'border-green/15 bg-green/[0.02]'
                      : isExpanded ? 'border-white/[0.09] bg-bg-elevated/40'
                      : 'border-white/[0.05] bg-bg-elevated/20',
                    )}>
                      {/* Card header — clickable to expand */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : si)}
                        aria-expanded={isExpanded}
                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50 sm:px-7"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className={cn(
                            'shrink-0 inline-block rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest',
                            stepDone
                              ? 'border-green/20 bg-green/[0.07] text-green'
                              : 'border-cyan/20 bg-cyan/[0.06] text-cyan',
                          )}>
                            {step.day}
                          </span>
                          <div className="min-w-0">
                            <h3 className={cn(
                              'truncate font-display text-base font-bold tracking-tight sm:text-lg',
                              stepDone ? 'text-green/80' : 'text-white',
                            )}>
                              {step.title}
                            </h3>
                            {!isExpanded && (
                              <p className="mt-0.5 truncate text-sm text-muted/60">{step.desc}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {step.tasks.length > 0 && (
                            <span className="text-xs font-bold text-muted/50">
                              {step.tasks.filter(t => t.completed).length}/{step.tasks.length}
                            </span>
                          )}
                          {stepDone
                            ? <CheckCircle2 className="h-5 w-5 text-green" aria-hidden="true" />
                            : isExpanded
                            ? <ChevronUp className="h-5 w-5 text-muted/40" aria-hidden="true" />
                            : <ChevronDown className="h-5 w-5 text-muted/40" aria-hidden="true" />
                          }
                        </div>
                      </button>

                      {/* Expandable body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/[0.05] px-5 py-6 sm:px-7">
                              <p className="mb-6 text-base leading-relaxed text-muted">{step.desc}</p>

                              {/* Tasks */}
                              {step.tasks.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted/60">Tasks</h4>
                                  <div className="space-y-2">
                                    {step.tasks.map((task, ti) => (
                                      <div key={ti} className="flex items-start gap-3">
                                        <button
                                          onClick={() => toggleTask(si, ti)}
                                          aria-checked={task.completed}
                                          role="checkbox"
                                          aria-label={task.text}
                                          className={cn(
                                            'mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 active:scale-90 focus-visible:outline-2 focus-visible:outline-cyan/50',
                                            task.completed
                                              ? 'border-cyan bg-cyan text-bg shadow-[0_0_10px_rgba(56,217,245,0.3)]'
                                              : 'border-white/20 bg-white/[0.02] hover:border-white/35',
                                          )}
                                        >
                                          {task.completed && <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />}
                                        </button>
                                        <span className={cn(
                                          'text-sm leading-relaxed transition-colors duration-200',
                                          task.completed ? 'text-muted/40 line-through' : 'text-foreground/85',
                                        )}>
                                          {task.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Resources */}
                              {step.resources.length > 0 && (
                                <div>
                                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted/60">Resources</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {step.resources.map(r => (
                                      <span
                                        key={r}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground hover:border-white/[0.12] hover:bg-white/[0.04]"
                                      >
                                        <Bookmark className="h-3 w-3 text-violet/50" aria-hidden="true" />
                                        {r}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Completion CTA */}
            {guide.progress === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 rounded-2xl border border-green/20 bg-gradient-to-br from-green/[0.06] to-transparent p-8 text-center"
              >
                <div className="mb-3 text-4xl">🎓</div>
                <h3 className="font-display text-2xl font-bold text-white">Study Guide Complete!</h3>
                <p className="mt-2 text-muted">You've finished all tasks. Test your knowledge with a quiz.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button to="/quiz" variant="gradient" size="lg">
                    Take a Quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => { setGuide(null); setTopic(''); }} variant="secondary" size="lg">
                    New Guide
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
