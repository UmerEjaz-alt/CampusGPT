import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Reveal from './components/ui/Reveal';
import SectionHeader from './components/ui/SectionHeader';
import Badge from './components/ui/Badge';

const TECH = [
  { icon: '⚛️', name: 'React 19',       desc: 'Modern UI with hooks and context'              },
  { icon: '🔷', name: 'TypeScript',     desc: 'Strict type safety across the frontend'        },
  { icon: '🎨', name: 'Tailwind CSS',   desc: 'Utility-first responsive styling system'       },
  { icon: '🎭', name: 'Framer Motion',  desc: 'Smooth animations and micro-interactions'      },
  { icon: '⚡', name: 'Vite',           desc: 'Lightning-fast build and dev server'           },
  { icon: '🟢', name: 'Node.js',        desc: 'Backend JavaScript runtime'                    },
  { icon: '🚂', name: 'Express.js',     desc: 'REST API and SSE streaming server'             },
  { icon: '🍃', name: 'MongoDB',        desc: 'NoSQL database via Mongoose ODM'               },
  { icon: '🔐', name: 'JWT + bcrypt',   desc: 'Secure auth stored in httpOnly cookies'        },
  { icon: '🛡️', name: 'Helmet + Zod',  desc: 'Security headers and request validation'       },
  { icon: '🤖', name: 'Groq AI',        desc: 'Llama 3.3 70B — fast open-source inference'   },
  { icon: '📦', name: 'PM2',            desc: 'Process manager for production deployments'    },
];

const TEAM = [
  { name: 'Umer Ejaz',   role: 'Full-Stack Developer',   grad: 'from-green to-cyan'    },
];

const STATS = [
  { val: '5',   label: 'Core pages'    },
  { val: '12+', label: 'Technologies'  },
  { val: '3',   label: 'AI features'   },
  { val: '4',   label: 'DB collections'},
];

const SECURITY_FLOW = [
  { text: 'Browser (React)',                    color: 'text-cyan font-bold',       indent: '' },
  { text: '  └── POST /api/chat/stream  ·  prompt sent, API key never exposed', color: 'text-muted/70', indent: '' },
  { text: 'Node.js Server (Express)',           color: 'text-violet font-bold',     indent: '' },
  { text: '  ├── Injects GROQ_API_KEY from server environment',                 color: 'text-muted/70', indent: '' },
  { text: '  └── Opens Server-Sent Events (SSE) stream to Groq',               color: 'text-muted/70', indent: '' },
  { text: 'Groq AI (Llama 3.3 70B)',            color: 'text-green font-bold',      indent: '' },
  { text: '  └── Processes prompt → streams tokens back to server',            color: 'text-muted/70', indent: '' },
  { text: 'MongoDB Atlas',                      color: 'text-amber font-bold',      indent: '' },
  { text: '  ├── Passwords hashed with bcrypt before storage',                 color: 'text-muted/70', indent: '' },
  { text: '  ├── Sessions stored in httpOnly cookies (XSS-safe)',              color: 'text-muted/70', indent: '' },
  { text: '  └── Chat histories saved per user for multi-session continuity',  color: 'text-muted/70', indent: '' },
];

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-foreground">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-cyan/[0.04] blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-violet/[0.04] blur-[140px]" aria-hidden="true" />

      {/* ── HERO ── */}
      <section className="relative border-b border-white/[0.04] section-block-sm">
        <div className="page-container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="cyan" className="mb-6">A Project For Students · 2026</Badge>
            <h1 className="text-balance font-display text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              About <span className="grad-text">CampusGPT</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              A full-stack AI learning platform built by BSCS student at SZABIST Islamabad —
              combining React, Node.js, MongoDB, and real-time LLM streaming to transform how students study.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT IS IT ── */}
      <section className="relative section-block-sm">
        <div className="page-container">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <div className="space-y-5">
                <Badge variant="violet" className="mb-2">The Project</Badge>
                <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
                  What is <span className="grad-text">CampusGPT</span>?
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-muted sm:text-base">
                  <p>
                    CampusGPT connects university students with{' '}
                    <span className="font-semibold text-white">Llama 3.3 70B via Groq</span> for
                    instant, contextual help with coursework — from explaining concepts to generating
                    practice quizzes on any topic.
                  </p>
                  <p>
                    Unlike typical student projects that rely on mock data, CampusGPT uses real JWT
                    authentication, persistent MongoDB storage, live SSE streaming, and industry-standard
                    security practices — the same patterns used in production SaaS applications.
                  </p>
                  <p>
                    The platform is deployed and runs 24/7, so students can access it from any device
                    without any local setup.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-col gap-4">
                {[
                  { icon: '💬', title: 'AI Chat Assistant',  border: 'border-cyan/10  bg-cyan/[0.01]',   desc: 'Real-time streaming chat with markdown rendering and syntax highlighting. Conversation history is saved to MongoDB so you can pick up where you left off.' },
                  { icon: '🧠', title: 'Quiz Generator',      border: 'border-violet/10 bg-violet/[0.01]', desc: 'AI-generated MCQs for any topic with instant answer feedback, explanations, and score tracking across all sessions.' },
                  { icon: '📚', title: 'Study Roadmaps',      border: 'border-pink/10   bg-pink/[0.01]',   desc: 'Day-by-day learning plans with tasks and curated resources. Mark tasks complete and track your overall progress.' },
                ].map(f => (
                  <Card key={f.title} padding="md" className={`flex gap-4 border ${f.border} rounded-2xl transition-all hover:scale-[1.01]`}>
                    <span className="mt-1 flex-shrink-0 text-2xl" aria-hidden="true">{f.icon}</span>
                    <div>
                      <div className="font-display text-sm font-bold tracking-wide text-white sm:text-base">{f.title}</div>
                      <div className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{f.desc}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <Card padding="md" className="border border-white/[0.04] bg-bg-elevated/20 py-5 text-center backdrop-blur-sm">
                  <div className="grad-text font-display text-3xl font-black tracking-tight">{s.val}</div>
                  <div className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">{s.label}</div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ARCHITECTURE ── */}
      <section className="border-y border-white/[0.04] bg-bg-elevated/20 section-block-sm backdrop-blur-md">
        <div className="page-container-narrow">
          <Reveal>
            <SectionHeader
              badge="Security"
              title={<>How the API key stays <span className="grad-text">secure</span></>}
              description="The Groq API key never leaves the server. The browser only sends a plain text prompt — the server handles all AI communication."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#020204] p-5 shadow-2xl sm:p-7">
              {/* Traffic light dots */}
              <div className="absolute right-4 top-4 flex gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-pink/40" />
                <span className="h-2 w-2 rounded-full bg-amber/40" />
                <span className="h-2 w-2 rounded-full bg-green/40" />
              </div>

              <div className="space-y-2.5 overflow-x-auto font-mono text-[0.75rem] leading-relaxed sm:text-sm">
                {SECURITY_FLOW.map((line, i) => (
                  <p key={i} className={`whitespace-pre ${line.color}`}>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="section-block-sm">
        <div className="page-container">
          <Reveal>
            <SectionHeader
              badge="Architecture"
              title={<>Technologies <span className="text-violet font-black">used</span></>}
              description="A modern full-stack setup covering frontend, backend, AI, database, and deployment."
            />
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TECH.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.025}>
                <Card hover padding="md" className="group flex items-center gap-3.5 border border-white/[0.04] bg-white/[0.01] rounded-xl transition-all hover:border-white/10 hover:bg-white/[0.02]">
                  <span className="flex-shrink-0 text-2xl transition-transform group-hover:scale-110" aria-hidden="true">{t.icon}</span>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold tracking-wide text-white">{t.name}</div>
                    <div className="mt-0.5 truncate text-xs font-medium text-muted">{t.desc}</div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="border-t border-white/[0.04] bg-bg-elevated/20 section-block-sm backdrop-blur-md">
        <div className="page-container">
          <Reveal>
            <SectionHeader
              badge="The Team"
              title={<>Meet the <span className="grad-text">builders</span></>}
              description="BS Computer Science students at SZABIST Islamabad · Section Alpha"
            />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.05}>
                <Card hover padding="md" className="group flex h-full flex-col justify-between rounded-2xl border border-white/[0.04] bg-bg-elevated/10 py-6 text-center hover:border-white/[0.08]">
                  <div>
                    <div
                      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${m.grad} font-display text-xl font-black text-neutral-950 shadow-lg transition-transform group-hover:scale-105`}
                      aria-hidden="true"
                    >
                      {m.name[0]}
                    </div>
                    <div className="font-display text-sm font-bold leading-snug text-white sm:text-base">{m.name}</div>
                    <div className="mt-1.5 inline-flex items-center rounded-full border border-cyan/10 bg-cyan/[0.03] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-cyan/80">
                      {m.reg}
                    </div>
                  </div>
                  <div className="mt-4 border-t border-white/[0.03] pt-3 text-xs font-semibold text-muted/60">
                    {m.role}
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t border-white/[0.04] section-block-sm">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/[0.06] blur-[120px]" />
        </div>
        <div className="page-container-narrow relative z-10 text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
              Ready to start <span className="grad-text">learning</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed text-muted">
              Explore CampusGPT's AI tools and take your academic performance to the next level.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Button to="/register" variant="gradient" size="lg">
                Get Started Free
              </Button>
              <Button to="/chat" variant="secondary" size="lg">
                Open AI Chat
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
