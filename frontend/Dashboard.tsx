import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, Trophy, BookOpen, Activity,
  ArrowRight, Zap, GraduationCap, Calendar, AlertTriangle,
  Flame, Compass, Clock,
} from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';
import Card from './components/ui/Card';
import EmptyState from './components/ui/EmptyState';
import Button from './components/ui/Button';
import { cn } from './components/ui/cn';

interface Stats  { chatCount: number; quizCount: number; guideCount: number; avgScore: number; }
interface RecentQ { _id: string; topic: string; difficulty: string; percentage: number; createdAt: string; }

function Sparkline({ heights, color }: { heights: number[]; color: string }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {heights.map((h, i) => (
        <div key={i} className={`w-[5px] rounded-sm opacity-50 ${color}`} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [recent,   setRecent]   = useState<RecentQ[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'activity'>('results');

  useEffect(() => {
    api.get('/api/user/dashboard')
      .then(r => { setStats(r.data.stats); setRecent(r.data.recentQuizzes ?? []); })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, []);

  const scoreBg = (p: number) =>
    p >= 80 ? 'border-green/20 bg-green/[0.06] text-green'
    : p >= 60 ? 'border-amber/20 bg-amber/[0.06] text-amber'
    : 'border-pink/20 bg-pink/[0.06] text-pink';

  const statCards = [
    { label: 'AI Chats',      val: stats?.chatCount ?? 0,   icon: MessageSquare, accent: 'text-cyan',   border: 'border-cyan/10',   bg: 'from-cyan/[0.05]',   href: '/chat',  hint: 'Conversations started', sparkHeights: [20,45,30,60,40,75,55], sparkColor: 'bg-cyan'   },
    { label: 'Quizzes Taken', val: stats?.quizCount ?? 0,   icon: Trophy,        accent: 'text-violet', border: 'border-violet/10', bg: 'from-violet/[0.05]', href: '/quiz',  hint: 'Tests completed',       sparkHeights: [35,50,45,70,55,80,65], sparkColor: 'bg-violet' },
    { label: 'Study Guides',  val: stats?.guideCount ?? 0,  icon: BookOpen,      accent: 'text-green',  border: 'border-green/10',  bg: 'from-green/[0.05]',  href: '/guide', hint: 'Plans created',         sparkHeights: [15,35,25,50,40,55,45], sparkColor: 'bg-green'  },
    { label: 'Avg Quiz Score',val: stats ? `${stats.avgScore}%` : '—', icon: Activity, accent: 'text-amber', border: 'border-amber/10', bg: 'from-amber/[0.05]', href: '/quiz', hint: 'Performance average', sparkHeights: [50,55,60,58,65,70,68], sparkColor: 'bg-amber'  },
  ];

  const quizCount = stats?.quizCount ?? 0;

  return (
    <div className="min-h-screen bg-bg text-foreground">

      {/* ── WELCOME HEADER ── */}
      <div className="border-b border-white/[0.05] bg-gradient-to-r from-violet/[0.06] via-transparent to-cyan/[0.04]">
        <div className="page-container-full py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan">
                <Zap className="h-3 w-3" aria-hidden="true" />
                Dashboard
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl xl:text-5xl">
                {getGreeting()},{' '}
                <span className="bg-gradient-to-r from-cyan via-violet to-pink bg-clip-text text-transparent">
                  {user?.username}
                </span>
              </h1>
              {user?.university && (
                <p className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  <GraduationCap className="h-3.5 w-3.5 text-violet" aria-hidden="true" />
                  {user.university}
                  {user.registrationNumber && <span className="text-muted/50">· {user.registrationNumber}</span>}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hidden sm:flex flex-col items-end gap-2"
            >
              <div className="text-xs text-muted">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-green/15 bg-green/[0.05] px-3 py-1.5 text-xs font-bold text-green">
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" aria-hidden="true" />
                All systems online
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="page-container-full space-y-10 py-10">

        {/* Error Banner */}
        {apiError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="alert"
            className="flex items-center gap-3 rounded-xl border border-amber/20 bg-amber/[0.05] px-5 py-3.5 text-sm text-amber">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Couldn't load your stats. Check your connection and refresh.</span>
          </motion.div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton min-h-[130px] rounded-lg" />
              ))
            : statCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link to={c.href} className="group block h-full">
                      <div className={cn(
                        'surface-card-interactive min-h-[130px] p-5 overflow-hidden bg-gradient-to-br to-transparent h-full',
                        c.bg, c.border,
                      )}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{c.label}</p>
                          <Icon className={cn('h-4 w-4 opacity-40 transition-opacity group-hover:opacity-80', c.accent)} aria-hidden="true" />
                        </div>
                        <p className={cn('font-display text-4xl font-black tracking-tight xl:text-5xl mb-3', c.accent)}>{c.val}</p>
                        <div className="flex items-end justify-between gap-2">
                          <span className="text-[11px] text-muted/60">{c.hint}</span>
                          <Sparkline heights={c.sparkHeights} color={c.sparkColor} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>

        {/* ── QUICK LAUNCH + RECENT ACTIVITY ── */}
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-5">

          {/* Quick Launch */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="xl:col-span-2" aria-labelledby="quick-launch-heading">
            <h2 id="quick-launch-heading" className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted/70">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
              Quick Launch
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { href: '/chat',  label: 'AI Chat',       desc: 'Ask questions, get instant explanations', icon: MessageSquare, gradient: 'from-cyan/[0.08]',   border: 'border-cyan/10 hover:border-cyan/25',   iconBg: 'border-cyan/20 bg-cyan/[0.08] text-cyan'    },
                { href: '/quiz',  label: 'Generate Quiz',  desc: 'Test your knowledge on any topic',        icon: Trophy,        gradient: 'from-violet/[0.08]', border: 'border-violet/10 hover:border-violet/25', iconBg: 'border-violet/20 bg-violet/[0.08] text-violet'},
                { href: '/guide', label: 'Study Guide',    desc: 'Build a personalized learning roadmap',   icon: BookOpen,      gradient: 'from-green/[0.08]',  border: 'border-green/10 hover:border-green/25',   iconBg: 'border-green/20 bg-green/[0.08] text-green'  },
              ].map(item => {
                const ActionIcon = item.icon;
                return (
                  <Link key={item.href} to={item.href} className="group block">
                    <div className={cn('surface-card-interactive bg-gradient-to-r to-transparent p-6 border transition-all', item.gradient, item.border)}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border', item.iconBg)}>
                            <ActionIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-display text-sm font-bold text-white">{item.label}</p>
                            <p className="mt-0.5 truncate text-xs text-muted">{item.desc}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 text-muted/20 transition-all group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>

          {/* Recent Activity */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="xl:col-span-3" aria-labelledby="recent-activity-heading">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="recent-activity-heading" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted/70">
                <span className="h-1.5 w-1.5 rounded-full bg-violet" aria-hidden="true" />
                Recent Activity
              </h2>
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.01] p-1">
                {(['results', 'activity'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-cyan/50 cursor-pointer',
                      activeTab === tab ? 'bg-white/[0.06] text-white' : 'text-muted/50 hover:text-muted',
                    )}
                  >
                    {tab === 'results' ? 'Quiz Results' : 'Activity'}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'activity' ? (
              <div className="surface-card p-10 text-center">
                <div className="mb-3 text-3xl">📊</div>
                <p className="text-sm font-bold text-white">Activity tracking coming soon</p>
                <p className="mt-1 text-xs text-muted">Your study timeline will appear here.</p>
              </div>
            ) : loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[4.5rem] rounded-xl" />)}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                icon={<Trophy className="h-6 w-6 text-violet/60" />}
                title="No quiz results yet"
                description="Take your first quiz to start tracking your progress and knowledge scores."
                actionLabel="Generate a quiz"
                actionTo="/quiz"
              />
            ) : (
                <div className="surface-card overflow-hidden border border-white/[0.05]">
                <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.05] bg-white/[0.01] px-5 py-3 sm:grid">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted/50">Topic</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted/50">Difficulty</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted/50 text-center">Score</span>
                </div>
                {recent.map((q, i) => (
                  <div key={q._id} className={cn('grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.015] sm:grid-cols-[1fr_auto_auto] sm:gap-4 sm:px-5', i > 0 && 'border-t border-white/[0.04]')}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{q.topic}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="hidden rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted sm:inline-flex">{q.difficulty}</span>
                    <span aria-label={`Score: ${q.percentage}%`} className={cn('min-w-[58px] rounded-xl border px-3 py-1.5 text-center font-mono text-sm font-black tabular-nums', scoreBg(q.percentage))}>
                      {q.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            {recent.length > 0 && (
              <Link to="/quiz" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted/40 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-cyan/50">
                Take another quiz <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </motion.section>
        </div>

        {/* ── LEARNING OVERVIEW ── */}
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} aria-labelledby="learning-overview-heading">
          <h2 id="learning-overview-heading" className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted/70">
            <span className="h-1.5 w-1.5 rounded-full bg-pink" aria-hidden="true" />
            Learning Overview
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Flame,   label: 'Study Streak',    value: '—',   hint: 'Start tracking',               color: 'text-amber',  border: 'border-amber/10',  bg: 'from-amber/[0.04]'  },
              { icon: Compass, label: 'Topics Explored', value: recent.length > 0 ? String(new Set(recent.map(r => r.topic)).size) : '0', hint: recent.length > 0 ? 'Unique subjects' : 'Take a quiz to track', color: 'text-violet', border: 'border-violet/10', bg: 'from-violet/[0.04]' },
              { icon: Clock,   label: 'Total Study Time', value: '—',  hint: 'Start tracking',               color: 'text-cyan',   border: 'border-cyan/10',   bg: 'from-cyan/[0.04]'   },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={cn('surface-card bg-gradient-to-br to-transparent p-6', item.bg, item.border)}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border bg-white/[0.03]', item.border)}>
                      <Icon className={cn('h-5 w-5', item.color)} aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted/70">{item.label}</span>
                  </div>
                  <p className={cn('font-display text-3xl font-black', item.color)}>{item.value}</p>
                  <p className="mt-1.5 text-xs text-muted/50">{item.hint}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ── ACHIEVEMENT CALLOUT ── */}
        {!loading && quizCount === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-violet/15 bg-gradient-to-r from-violet/[0.06] via-transparent to-cyan/[0.04] px-6 py-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet/20 bg-violet/[0.1] text-2xl">
                  🏆
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-white">Complete your first quiz to unlock achievements</p>
                  <p className="mt-0.5 text-xs text-muted">Track your knowledge growth and earn milestones.</p>
                </div>
              </div>
              <Button to="/quiz" variant="gradient" size="sm">
                Take a Quiz <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
