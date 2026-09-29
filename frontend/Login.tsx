import { useState, useRef, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import Input from './components/ui/Input';
import Button from './components/ui/Button';
import Reveal from './components/ui/Reveal';
import KnowledgeField from './components/ui/KnowledgeField';
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.error || 'We could not sign you in. Check your email and password, then try again.'); emailRef.current?.focus(); }
    finally { setLoading(false); }
  }
  return <div className="auth-layout"><KnowledgeField className="auth-field" density="medium" tint="ivory" />
    <section className="auth-form-side"><Reveal className="auth-form-wrap"><Link to="/" className="auth-back">Back to CampusGPT</Link><h1>Welcome<br /><em>back.</em></h1><p className="auth-description">Your next moment of clarity is waiting.</p><form onSubmit={submit} className="form-stack">
      <Input ref={emailRef} label="Email address" type="email" autoComplete="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
      <Input label="Password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} trailing={<button type="button" className="icon-button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} title={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
      {error && <p className="alert" role="alert">{error}</p>}
      <Button type="submit" size="lg" disabled={loading || !email || !password}>{loading ? 'Signing in...' : 'Log in'}<ArrowRight size={18} /></Button>
    </form><p className="auth-switch">New here? <Link to="/register">Create an account</Link></p></Reveal><span className="auth-footnote">A space for whatever you're learning next.</span></section>
    <aside className="auth-image"><img src="/images/library.jpg" alt="Quiet library study desks" /><div><p>Pick up<br />where curiosity<br /><em>left off.</em></p><span>Your questions belong here.</span></div></aside>
  </div>;
}
