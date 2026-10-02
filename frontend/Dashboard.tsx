import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ListChecks, BookOpen, ArrowUpRight, ArrowRight, CalendarDays } from 'lucide-react';
import { useAuth } from './AuthContext';
import api from './api';
import PageHeader from './components/ui/PageHeader';
import EmptyState from './components/ui/EmptyState';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import Reveal from './components/ui/Reveal';
import LoadingSpinner from './components/ui/LoadingSpinner';
import KnowledgeField from './components/ui/KnowledgeField';
interface Stats { chatCount: number; quizCount: number; guideCount: number; avgScore: number; }
interface Result { _id: string; topic: string; difficulty: string; percentage: number; createdAt: string; }
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState('results');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true); setError(false);
    api.get('/api/user/dashboard').then(r => { if (live) { setStats(r.data.stats); setRecent(r.data.recentQuizzes || []); } }).catch(() => { if (live) setError(true); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [retry]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return <div className="workspace-page"><KnowledgeField className="workspace-field" density="low" tint="brass" /><div className="container">
    <PageHeader title={<>{greeting}, {user?.username}.</>} description={user?.university || 'Make a little room for learning today.'}><div className="dashboard-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}<br />Your learning workspace</div></PageHeader>
    {error && <div className="alert" role="alert">Your progress couldn't be loaded. <button onClick={() => setRetry(r => r + 1)} className="text-link">Try again</button></div>}
    <section className="stats-row" aria-label="Learning statistics">{[
      ['Conversations', stats?.chatCount, '/chat'], ['Quizzes completed', stats?.quizCount, '/quiz'], ['Study plans', stats?.guideCount, '/guide'], ['Average quiz score', stats ? stats.avgScore + '%' : null, '/quiz'],
    ].map(([label, value, to]) => <Link key={label} to={String(to)} className="stat-item"><p>{label}</p><strong>{loading ? '...' : error ? '—' : value ?? '0'}</strong></Link>)}</section>
    <section className="workspace-section"><h2>Where would you like to begin?</h2><div className="launch-list">{[
      [MessageSquare, 'Talk it through', 'Pick up a conversation or start with a new question.', '/chat'],
      [ListChecks, 'Put it into practice', 'Make a quiz from the topic you are working on.', '/quiz'],
      [BookOpen, 'Make a study plan', 'Break your next subject into manageable steps.', '/guide'],
    ].map(([Icon, title, description, to]: any) => <Link to={to} key={to}><Icon size={23} strokeWidth={1.6} /><ArrowUpRight size={19} /><h3>{title}</h3><p>{description}</p></Link>)}</div></section>
    <div className="dashboard-lower"><section><div className="section-bar"><h2>Recent work</h2><div className="segmented" role="group" aria-label="Recent work view"><button aria-pressed={active === 'results'} onClick={() => setActive('results')}>Quiz results</button><button aria-pressed={active === 'activity'} onClick={() => setActive('activity')}>Activity</button></div></div>
      {active === 'activity' ? <EmptyState icon={<CalendarDays />} title="Your timeline is next" description="Activity tracking is coming soon. Your quiz results are available now." />
      : loading ? <LoadingSpinner label="Loading your results..." /> : error ? <p className="sidebar-note">Results are unavailable. Use Try again above to reload your progress.</p> : recent.length ? <><table className="results-table"><thead><tr><th scope="col">Topic</th><th scope="col">Difficulty</th><th scope="col">Score</th></tr></thead><tbody>{recent.map(q => <tr key={q._id}><td>{q.topic}<small>{new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></td><td><Badge>{q.difficulty}</Badge></td><td><Badge variant={q.percentage >= 80 ? 'green' : q.percentage >= 60 ? 'amber' : 'pink'}>{q.percentage}%</Badge></td></tr>)}</tbody></table><Link className="text-link" to="/quiz">Practice again <ArrowRight size={15} /></Link></>
      : <EmptyState icon={<ListChecks />} title="Your first result starts here" description="Complete a practice quiz to see your results and track your understanding." actionLabel="Create a quiz" actionTo="/quiz" />}</section>
      <aside className="learning-overview"><h2>The bigger picture</h2><dl><div><dt>Topics explored</dt><dd>{error ? '—' : new Set(recent.map(r => r.topic)).size}</dd></div><div><dt>Study streak</dt><dd>Not tracked yet</dd></div><div><dt>Study time</dt><dd>Not tracked yet</dd></div></dl>{!loading && !error && !stats?.quizCount && <Reveal className="dashboard-note"><h3>Start with what you know.</h3><p>Your first quiz is a useful place to find your strengths and what needs another look.</p><Button to="/quiz" variant="secondary" size="sm">Take a quiz <ArrowUpRight size={15} /></Button></Reveal>}</aside>
    </div>
  </div></div>;
}
