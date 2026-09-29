import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Plus, BookOpen, CalendarDays, Clock, Layers, Folder, ChevronDown, Check, Bookmark } from 'lucide-react';
import api from './api';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import PageHeader from './components/ui/PageHeader';
import ChoiceGroup from './components/ui/ChoiceGroup';
import LoadingSpinner from './components/ui/LoadingSpinner';
import KnowledgeField from './components/ui/KnowledgeField';
interface Task { text: string; completed: boolean; }
interface Step { day: string; title: string; desc: string; tasks: Task[]; resources: string[]; }
interface Guide { _id: string; topic: string; level: string; duration: string; overview: { days: number; hours: number; topics: number; projects: number }; steps: Step[]; progress: number; }
const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
const durations = ['1 Week', '2 Weeks', '1 Month'] as const;
export default function Roadmap() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<typeof levels[number]>('Beginner');
  const [duration, setDuration] = useState<typeof durations[number]>('1 Week');
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(0);
  const [saving, setSaving] = useState<string | null>(null);
  async function generate(e: FormEvent) {
    e.preventDefault(); if (!topic.trim()) return;
    setLoading(true); setError(''); setGuide(null); setExpanded(0);
    try {
      const { data } = await api.post('/api/guide/generate', { topic, level, duration });
      if (!data?.guide?._id || !Array.isArray(data.guide.steps) || !data.guide.steps.length) {
        throw new Error('The study plan was incomplete. Please try again.');
      }
      setGuide(data.guide);
    }
    catch (err: any) { setError(err.response?.data?.error || err.message || 'Your plan could not be created. Please try again.'); }
    finally { setLoading(false); }
  }
  async function toggle(si: number, ti: number) {
    if (!guide || saving) return;
    const before = guide;
    const next = { ...guide, steps: guide.steps.map((s, i) => i !== si ? s : { ...s, tasks: s.tasks.map((t, j) => j !== ti ? t : { ...t, completed: !t.completed }) }) };
    const tasks = next.steps.flatMap(s => s.tasks);
    next.progress = tasks.length ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) : 0;
    setGuide(next); setSaving(si + '-' + ti); setError('');
    try { await api.put('/api/user/guides/task', { guideId: guide._id, stepIndex: si, taskIndex: ti, completed: next.steps[si].tasks[ti].completed }); }
    catch { setGuide(before); setError('That task could not be saved. Please try checking it again.'); }
    finally { setSaving(null); }
  }
  function reset() { setGuide(null); setTopic(''); setError(''); }
  if (loading) return <div className="route-loading"><LoadingSpinner label={'Building your ' + duration.toLowerCase() + ' plan for ' + topic + '...'} /></div>;
  if (!guide) return <div className="workspace-page"><KnowledgeField className="workspace-field" density="low" tint="brass" /><div className="container"><PageHeader title="Big subjects. Manageable steps." description="Give your next chapter a little structure." /><div className="setup-layout"><form className="setup-form form-stack" onSubmit={generate}>
    <Input label="What would you like to learn?" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Relational databases" required hint="Choose a topic you'd like to spend some time with." />
    <ChoiceGroup label="Where are you starting?" value={level} options={levels} onChange={setLevel} />
    <ChoiceGroup label="How much time do you have?" value={duration} options={durations} onChange={setDuration} />
    {error && <p role="alert" className="alert">{error}</p>}
    <div><Button type="submit" disabled={!topic.trim()} size="lg">Build my study plan <ArrowRight size={18} /></Button></div>
  </form><aside className="setup-aside"><BookOpen className="aside-art" /><h2>A clear next step.<br /><em>Every day.</em></h2><p>Your plan brings together daily topics, focused tasks, and resources to keep your study sessions moving.</p><ol><li>Start at your current level.</li><li>Work through the daily tasks.</li><li>Check off progress as you go.</li></ol></aside></div></div></div>;
  const completed = guide.steps.filter(s => s.tasks.length && s.tasks.every(t => t.completed)).length;
  return <div className="workspace-page"><KnowledgeField className="workspace-field" density="low" tint="brass" /><div className="container"><PageHeader title={guide.topic} description={guide.level + ' · ' + guide.duration + ' study plan'}><Button variant="secondary" onClick={reset}><Plus size={18} />New plan</Button></PageHeader>
    <div className="guide-overview">{[[CalendarDays, guide.overview?.days, 'days'], [Clock, guide.overview?.hours, 'hours'], [Layers, guide.overview?.topics, 'topics'], [Folder, guide.overview?.projects, 'projects']].map(([Icon, value, label]: any) => <div key={label}><Icon size={18} /><strong>{value ?? '—'}</strong>{label}</div>)}</div>
    {error && <p role="alert" className="alert">{error}</p>}
    <div className="guide-layout"><aside className="guide-progress"><h2>Your progress</h2><strong>{guide.progress}%</strong><progress className="progress" value={guide.progress} max={100} aria-label="Study plan progress" /><p aria-live="polite">{completed} of {guide.steps.length} days complete</p>{guide.progress === 100 && <div className="dashboard-note"><h3>A chapter completed.</h3><p>Put your new understanding into practice.</p><Button to="/quiz" size="sm">Take a quiz <ArrowRight size={15} /></Button></div>}</aside>
    <div>{guide.steps.map((step, si) => { const done = step.tasks.length > 0 && step.tasks.every(t => t.completed); return <section className="guide-step" key={si}><h2><button className="guide-toggle" aria-expanded={expanded === si} aria-controls={'step-body-' + si} onClick={() => setExpanded(expanded === si ? null : si)}><span>{step.day}</span><span className="step-title">{step.title}</span><span className="step-count">{step.tasks.filter(t => t.completed).length}/{step.tasks.length}</span>{done ? <Check size={18} /> : <ChevronDown size={18} style={{ transform: expanded === si ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />}</button></h2><AnimatePresence initial={false}>{expanded === si && <motion.div id={'step-body-' + si} className="guide-step-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}><div className="guide-step-content"><p>{step.desc}</p>{step.tasks.length > 0 && <><h3>Today's tasks</h3>{step.tasks.map((task, ti) => <label className={'task-label ' + (task.completed ? 'completed' : '')} key={ti}><input type="checkbox" checked={task.completed} disabled={saving !== null} onChange={() => toggle(si, ti)} /><span>{task.text}</span></label>)}</>}{step.resources.length > 0 && <><h3>Further reading & resources</h3><ul className="resources">{step.resources.map((r, i) => <li key={i}><Bookmark size={14} /><span>{r}</span></li>)}</ul></>}</div></motion.div>}</AnimatePresence></section>; })}</div></div>
  </div></div>;
}
