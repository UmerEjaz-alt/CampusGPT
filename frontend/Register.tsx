import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import Input from './components/ui/Input';
import Button from './components/ui/Button';
import Reveal from './components/ui/Reveal';
import KnowledgeField from './components/ui/KnowledgeField';
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', registrationNumber: '', university: 'SZABIST' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const change = (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.error || 'We could not create your account. Please try again.'); }
    finally { setLoading(false); }
  }
  return <div className="auth-layout register-layout"><KnowledgeField className="auth-field" density="medium" tint="ivory" />
    <section className="auth-form-side"><Reveal className="auth-form-wrap"><Link to="/" className="auth-back">Back to CampusGPT</Link><h1>Make yourself<br /><em>at home.</em></h1><p className="auth-description">A fresh space for your next chapter.</p><form onSubmit={submit} className="form-stack">
      <Input label="Username" name="username" autoComplete="username" placeholder="Your name" value={form.username} onChange={change} required disabled={loading} />
      <Input label="Email address" type="email" name="email" autoComplete="email" placeholder="you@university.edu" value={form.email} onChange={change} required disabled={loading} />
      <Input label="Password" name="password" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={change} required disabled={loading} trailing={<button type="button" className="icon-button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} title={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
      <div className="form-row"><Input label="University" name="university" value={form.university} onChange={change} required disabled={loading} /><Input label="Registration no." name="registrationNumber" placeholder="Optional" value={form.registrationNumber} onChange={change} disabled={loading} /></div>
      {error && <p className="alert" role="alert">{error}</p>}
      <Button type="submit" size="lg" disabled={loading || !form.username || !form.email || !form.password || !form.university}>{loading ? 'Creating your account...' : 'Create account'}<ArrowRight size={18} /></Button>
    </form><p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p></Reveal></section>
    <aside className="auth-image"><img src="/images/library.jpg" alt="Bookshelves and reading desks ready for a study session" /><div><p>Big ideas.<br />Small steps.<br /><em>Your pace.</em></p><span>Let's see where curiosity takes you.</span></div></aside>
  </div>;
}
