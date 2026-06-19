import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import Input from './components/ui/Input';
import Button from './components/ui/Button';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const emailRef   = useRef<HTMLInputElement>(null);

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Incorrect email or password. Please try again.');
      emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell relative overflow-hidden bg-bg">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/[0.09] blur-[130px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 h-[280px] w-[280px] rounded-full bg-cyan/[0.05] blur-[100px]" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="auth-card relative z-10 overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-cyan via-violet to-pink" aria-hidden="true" />

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
            <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
          </div>
          <div className="mb-2.5 font-display text-3xl font-extrabold tracking-tight">
            <span className="grad-text">Campus</span>
            <span className="text-foreground">GPT</span>
          </div>
          <h1 className="font-display text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Email */}
          <div className="relative">
            <Input
              ref={emailRef}
              label="Email"
              type="email"
              id="login-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              autoComplete="email"
              disabled={loading}
              className="pl-10"
            />
            <Mail className="pointer-events-none absolute left-3.5 top-[2.55rem] h-4 w-4 text-muted/40" aria-hidden="true" />
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
              className="pl-10 pr-11"
            />
            <Lock className="pointer-events-none absolute left-3.5 top-[2.55rem] h-4 w-4 text-muted/40" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-3.5 top-[2.45rem] rounded-md p-1 text-muted/40 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-cyan/50 cursor-pointer"
            >
              {showPassword
                ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                : <Eye className="h-4 w-4" aria-hidden="true" />
              }
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-xl border border-pink/20 bg-pink/[0.06] px-4 py-3 text-center text-sm font-medium text-pink"
            >
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={loading || !email || !password}
            className="mt-1 w-full justify-center"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 border-t border-white/[0.05] pt-5 text-center text-xs text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-cyan underline decoration-cyan/30 underline-offset-2 hover:decoration-cyan transition-colors">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
