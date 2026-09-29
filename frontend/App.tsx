import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const ChatPortal = lazy(() => import('./ChatPortal'));
const QuizEngine = lazy(() => import('./QuizEngine'));
const Roadmap = lazy(() => import('./Roadmap'));
const Dashboard = lazy(() => import('./Dashboard'));
const titles: Record<string, string> = { '/': 'Your space to understand', '/about': 'About', '/login': 'Welcome back', '/register': 'Create an account', '/chat': 'Study chat', '/quiz': 'Practice', '/guide': 'Study plans', '/dashboard': 'Your workspace' };
function Guard({ children, publicOnly = false }: { children: ReactNode; publicOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-loading"><LoadingSpinner /></div>;
  return publicOnly ? user ? <Navigate to="/dashboard" replace /> : children : user ? children : <Navigate to="/login" replace />;
}
function Layout() {
  const { pathname } = useLocation();
  const workspace = ['/dashboard', '/chat', '/quiz', '/guide'].includes(pathname);
  useEffect(() => {
    document.title = (titles[pathname] || 'CampusGPT') + ' | CampusGPT';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  const authRoute = ['/login', '/register'].includes(pathname);
  return <div className={workspace ? 'app app-workspace' : 'app'}>
    {!authRoute && <Navbar />}
    <main id="main-content" tabIndex={-1}><Suspense fallback={<div className="route-loading"><LoadingSpinner /></div>}>
      <Routes>
        <Route path="/" element={<Home />} /><Route path="/about" element={<About />} />
        <Route path="/login" element={<Guard publicOnly><Login /></Guard>} />
        <Route path="/register" element={<Guard publicOnly><Register /></Guard>} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/chat" element={<Guard><ChatPortal /></Guard>} />
        <Route path="/quiz" element={<Guard><QuizEngine /></Guard>} />
        <Route path="/guide" element={<Guard><Roadmap /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense></main>
    {!workspace && !authRoute && <Footer />}
  </div>;
}
export default function App() {
  return <BrowserRouter><MotionConfig reducedMotion="user"><AuthProvider><Layout /></AuthProvider></MotionConfig></BrowserRouter>;
}
