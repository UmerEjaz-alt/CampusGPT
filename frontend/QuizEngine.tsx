import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, Check, X, Clock, ListChecks } from 'lucide-react';
import api from './api';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import PageHeader from './components/ui/PageHeader';
import ChoiceGroup from './components/ui/ChoiceGroup';
import LoadingSpinner from './components/ui/LoadingSpinner';
import KnowledgeField from './components/ui/KnowledgeField';
interface Question { q: string; options: string[]; ans: number; explanation: string; }
const difficulties = ['Easy', 'Medium', 'Hard'] as const;
export default function QuizEngine() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<typeof difficulties[number]>('Medium');
  const [count, setCount] = useState<number>(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  async function generate(e: FormEvent) {
    e.preventDefault(); if (!topic.trim()) return;
    setLoading(true); setError(''); setQuestions([]); setAnswers([]); setSubmitted(false); setScore(0); setSaveNotice('');
    try {
      const { data } = await api.post('/api/quiz/generate', { topic, difficulty, count });
      if (!data?.quizId || !Array.isArray(data.questions) || data.questions.length !== count) {
        throw new Error('The quiz was incomplete. Please try again.');
      }
      setQuestions(data.questions); setQuizId(data.quizId); setAnswers(new Array(data.questions.length).fill(-1));
    }
    catch (err: any) { setError(err.response?.data?.error || err.message || 'We could not create this quiz. Please try again.'); }
    finally { setLoading(false); }
  }
  function choose(qi: number, oi: number) { if (submitted || answers[qi] !== -1) return; setAnswers(prev => prev.map((a, i) => i === qi ? oi : a)); }
  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const localScore = answers.filter((a, i) => a === questions[i]?.ans).length;
    try { const { data } = await api.post('/api/quiz/submit', { quizId, answers }); setScore(data.score ?? localScore); }
    catch { setScore(localScore); setSaveNotice('Your score is shown below, but it could not be saved to your account.'); }
    setSubmitted(true); setSubmitting(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reset() { setQuestions([]); setAnswers([]); setSubmitted(false); setScore(0); setQuizId(null); setError(''); setSaveNotice(''); }
  const answered = answers.filter(a => a !== -1).length;
  const pct = questions.length ? Math.round(score / questions.length * 100) : 0;
  if (loading) return <div className="route-loading"><LoadingSpinner label={'Preparing ' + count + ' questions on ' + topic + '...'} /></div>;
  if (!questions.length) return <div className="workspace-page"><KnowledgeField className="workspace-field" density="low" tint="brass" /><div className="container"><PageHeader title="A little practice goes a long way." description="Make space to test what you know." /><div className="setup-layout"><form className="setup-form form-stack" onSubmit={generate}>
    <Input label="What are you studying?" placeholder="e.g. Binary search trees" value={topic} onChange={e => setTopic(e.target.value)} required hint="A specific topic gives your practice more focus." />
    <ChoiceGroup label="Difficulty" value={difficulty} options={difficulties} onChange={setDifficulty} />
    <ChoiceGroup label="Number of questions" value={count} options={[3, 5, 10]} onChange={setCount} />
    <p className="form-summary"><Clock size={16} />About {count * 2}–{count * 3} minutes of practice</p>
    {error && <p className="alert" role="alert">{error}</p>}
    <div><Button type="submit" disabled={!topic.trim()} size="lg">Create practice quiz <ArrowRight size={18} /></Button></div>
  </form><aside className="setup-aside"><ListChecks className="aside-art" /><h2>Find the gaps.<br /><em>Build your understanding.</em></h2><p>Each quiz is generated for your topic and level. Your results help you decide what to revisit.</p><ol><li>Choose one answer for each question.</li><li>Submit to see your score and explanations.</li><li>Review what you missed, then try again.</li></ol><p>Questions generated with Llama 3.3 70B via Groq.</p></aside></div></div></div>;
  return <div className="quiz-page"><KnowledgeField className="workspace-field" density="low" tint="brass" />
    {!submitted && <div className="quiz-status"><div className="container-narrow"><div className="quiz-status-inner"><div><h1>{topic}</h1><p>{difficulty} · {answered} of {questions.length} answered</p></div><Button variant="ghost" size="sm" onClick={reset}><RotateCcw size={16} />Start over</Button></div><progress className="progress" value={answered} max={questions.length} aria-label="Quiz completion" /></div></div>}
    <div className="container-narrow quiz-content">
    {submitted && <section className="quiz-result"><div><h1>{pct >= 80 ? 'Look at what you know.' : pct >= 60 ? 'A solid step forward.' : 'Every attempt teaches you something.'}</h1><p>{score} correct out of {questions.length} questions on {topic}.</p><div className="result-actions"><Button onClick={reset}><RotateCcw size={16} />New quiz</Button><Button variant="secondary" onClick={() => document.getElementById('answer-review')?.scrollIntoView({ behavior: 'smooth' })}>Review answers <ArrowRight size={16} /></Button></div></div><div className="result-score">{pct}%<small>Your result</small></div></section>}
    {saveNotice && <p className="alert" role="status">{saveNotice}</p>}
    <div className="question-list" id="answer-review">{questions.map((q, qi) => <motion.fieldset className="question" key={qi} initial={{ opacity: .6, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(qi * .04, .24) }}><legend><span className="question-number">Question {qi + 1} of {questions.length}</span>{q.q}</legend><div className="answer-options">{q.options.map((option, oi) => {
      const correct = submitted && oi === q.ans;
      const wrong = submitted && answers[qi] === oi && oi !== q.ans;
      return <button key={oi} disabled={answers[qi] !== -1 || submitted} onClick={() => choose(qi, oi)} aria-pressed={answers[qi] === oi} className={'answer-option ' + (correct ? 'correct' : wrong ? 'wrong' : answers[qi] === oi ? 'chosen' : '')}><span>{String.fromCharCode(65 + oi)}</span><span>{option}</span>{correct ? <Check size={18} aria-label="Correct answer" /> : wrong ? <X size={18} aria-label="Incorrect answer" /> : answers[qi] === oi ? <Check size={18} aria-label="Selected answer" /> : null}</button>;
    })}</div>{submitted && <p className="answer-explanation"><strong>{answers[qi] === q.ans ? 'Correct. ' : 'Worth another look. '}</strong>{q.explanation}</p>}</motion.fieldset>)}</div>
    {!submitted && <div className="quiz-submit"><p aria-live="polite">{answered === questions.length ? 'All questions answered. Ready when you are.' : questions.length - answered + ' questions to go.'}</p><Button disabled={answered !== questions.length || submitting} onClick={submit}>{submitting ? 'Saving your result...' : 'See my results'}<ArrowRight size={18} /></Button></div>}
    </div>
  </div>;
}
