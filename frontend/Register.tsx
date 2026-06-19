import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Hash, School, UserPlus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';
import Input from './components/ui/Input';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    registrationNumber: '',
    university: 'SZABIST',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.username && form.email && form.password && form.university;

  return (
    <div className="auth-shell relative overflow-hidden bg-bg py-12">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.05] blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-[300px] w-[300px] rounded-full bg-violet/[0.08] blur-[110px]" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="auth-card relative z-10 max-w-[28rem] overflow-hidden"
      >
        {/* Top accent */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-pink via-violet to-cyan" aria-hidden="true" />

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
            <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
          </div>
          <Badge variant="cyan" className="mb-3">Free to join</Badge>
          <h1 className="mt-2 font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted">Set up your profile and start using AI study tools</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Username */}
          <div className="relative">
            <Input
              label="Username"
              name="username"
              id="reg-username"
              value={form.username}
              onChange={handleChange}
              placeholder="your_username"
              required
              autoComplete="username"
              disabled={loading}
              className="pl-10"
            />
            <User className="pointer-events-none absolute left-3.5 top-[2.55rem] h-4 w-4 text-muted/40" aria-hidden="true" />
          </div>

          {/* Email */}
          <div className="relative">
            <Input
              label="Email"
              type="email"
              name="email"
              id="reg-email"
              value={form.email}
              onChange={handleChange}
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
              name="password"
              id="reg-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
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

          {/* Reg No + University row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <Input
                label="Registration No."
                name="registrationNumber"
                id="reg-regnumber"
                value={form.registrationNumber}
                onChange={handleChange}
                placeholder="2580126"
                hint="Optional"
                disabled={loading}
                className="pl-10"
              />
              <Hash className="pointer-events-none absolute left-3.5 top-[2.55rem] h-4 w-4 text-muted/40" aria-hidden="true" />
            </div>
            <div className="relative">
              <Input
                label="University"
                name="university"
                id="reg-university"
                value={form.university}
                onChange={handleChange}
                placeholder="SZABIST"
                required
                disabled={loading}
                className="pl-10"
              />
              <School className="pointer-events-none absolute left-3.5 top-[2.55rem] h-4 w-4 text-muted/40" aria-hidden="true" />
            </div>
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
            disabled={loading || !canSubmit}
            className="mt-1 w-full justify-center"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 border-t border-white/[0.05] pt-5 text-center text-xs text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-cyan underline decoration-cyan/30 underline-offset-2 hover:decoration-cyan transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
