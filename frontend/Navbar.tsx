import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, User, ArrowRight, MessageSquare, Brain, BookOpen,
  LayoutDashboard, Home, Info, Menu, X,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import Button from './components/ui/Button';

const publicLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
];

const protectedLinks = [
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/guide', label: 'Study Guide', icon: BookOpen },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const visibleLinks = user ? [...publicLinks, ...protectedLinks] : publicLinks;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={[
          'fixed inset-x-0 top-0 z-50 h-16 border-b transition-all duration-300',
          scrolled
            ? 'border-white/[0.08] bg-bg/86 shadow-[0_10px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl'
            : 'border-transparent bg-bg/45 backdrop-blur-md',
        ].join(' ')}
      >
        <div className="page-container-full flex h-full items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="CampusGPT home"
            className="group flex shrink-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan/50"
          >
            <span className="font-display text-lg font-extrabold tracking-tight text-white transition-opacity group-hover:opacity-85">
              Campus<span className="bg-gradient-to-r from-cyan via-violet to-pink bg-clip-text text-transparent">GPT</span>
            </span>
          </Link>

          <ul
            className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.025] p-1 lg:flex"
            role="list"
          >
            {visibleLinks.map(link => {
              const active = isActive(link.href);
              return (
                <li key={link.href} className="relative">
                  <Link
                    to={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'relative z-10 block rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors duration-200',
                      active ? 'text-white' : 'text-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/[0.08]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {user ? (
              <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] py-1.5 pl-3 pr-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan/20 bg-cyan/10 font-mono text-[10px] font-black uppercase text-cyan"
                    aria-hidden="true"
                  >
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[9rem] truncate text-xs font-semibold text-muted">
                    {user.username}
                  </span>
                </div>
                <div className="h-4 w-px bg-white/[0.08]" aria-hidden="true" />
                <button
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-bold uppercase tracking-wider text-muted/70 transition-colors hover:text-pink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50"
                >
                  Log in
                </Link>
                <Button to="/register" variant="gradient" size="sm" className="uppercase tracking-wider">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50 lg:hidden"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            key="mobile-menu"
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-bg/97 px-4 pb-6 pt-20 backdrop-blur-2xl sm:px-6 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {visibleLinks.map((link, idx) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                  >
                    <Link
                      to={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'flex min-h-12 items-center gap-3 rounded-lg border px-4 py-3 text-base font-semibold transition-all',
                        active
                          ? 'border-white/[0.08] bg-white/[0.06] text-white'
                          : 'border-transparent text-muted hover:text-foreground',
                      ].join(' ')}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-cyan' : 'text-muted/60'}`} aria-hidden="true" />
                      {link.label}
                      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />}
                    </Link>
                  </motion.div>
                );
              })}

              {!user && (
                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted/60">Account</p>
                  <Link
                    to="/login"
                    className="flex min-h-12 items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-base font-semibold text-muted transition-all hover:text-foreground"
                  >
                    <User className="h-4 w-4 text-muted/60" aria-hidden="true" />
                    Log in
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-5">
              {user ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{user.username}</p>
                    <p className="truncate text-xs text-muted">{user.university || 'Student'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-pink/20 bg-pink/[0.05] px-3 py-2 text-xs font-bold uppercase tracking-wider text-pink transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="rounded-lg border border-white/[0.08] bg-white/[0.02] py-3.5 text-center text-sm font-bold uppercase tracking-wider text-muted transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-cyan/50"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-white py-3.5 text-center text-sm font-bold uppercase tracking-wider text-black shadow-lg transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-cyan/50"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
