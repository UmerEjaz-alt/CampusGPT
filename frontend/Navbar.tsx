import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, ArrowUpRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import Button from './components/ui/Button';
export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const links = user ? [['Workspace', '/dashboard'], ['Chat', '/chat'], ['Practice', '/quiz'], ['Study plans', '/guide'], ['About', '/about']] : [['Home', '/'], ['About the project', '/about']];
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (open) { dialog.current?.showModal(); document.body.style.overflow = 'hidden'; }
    else if (dialog.current?.open) { dialog.current.close(); trigger.current?.focus(); }
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const signOut = async () => { await logout(); navigate('/'); };
  const workspace = ['/dashboard', '/chat', '/quiz', '/guide'].includes(pathname);
  return <header className={'site-nav ' + (workspace ? 'site-nav-workspace' : 'site-nav-public')}>
    <div className="nav-inner">
      <Link className="brand" to="/" aria-label="CampusGPT home"><BookOpen aria-hidden="true" /><span>CampusGPT<span className="brand-period">/</span></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, to]) => <NavLink key={to} end to={to}>{label}</NavLink>)}</nav>
      <div className="nav-account">{user ? <><span className="account-name">{user.username}</span><button className="icon-button" title="Sign out" aria-label="Sign out" onClick={signOut}><LogOut /></button></> : <><Link to="/login">Log in</Link><Button to="/register" size="sm">Start learning <ArrowUpRight size={15} /></Button></>}</div>
      <button ref={trigger} className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button>
    </div>
    <dialog ref={dialog} className="nav-dialog" aria-label="Navigation" onCancel={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="drawer-header"><span className="brand">CampusGPT/</span><button className="icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}><X /></button></div>
      <nav aria-label="Mobile navigation">{links.map(([label, to]) => <NavLink key={to} end to={to} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={18} /></NavLink>)}</nav>
      <div className="drawer-bottom">{user ? <Button onClick={signOut} variant="secondary"><LogOut size={16} /> Sign out</Button> : <><Button to="/login" variant="secondary">Log in</Button><Button to="/register">Start learning</Button></>}</div>
    </dialog>
  </header>;
}
