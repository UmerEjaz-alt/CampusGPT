import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import OrbBg from './OrbBg';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import ChatPortal from './ChatPortal';
import QuizEngine from './QuizEngine';
import Roadmap from './Roadmap';
import Dashboard from './Dashboard';
import About from './About';
import LoadingSpinner from './components/ui/LoadingSpinner';

const PAGE_TITLES: Record<string, string> = {
  '/': 'CampusGPT - AI Academic Assistant',
  '/about': 'About - CampusGPT',
  '/login': 'Sign In - CampusGPT',
  '/register': 'Create Account - CampusGPT',
  '/chat': 'AI Chat - CampusGPT',
  '/quiz': 'Quiz Generator - CampusGPT',
  '/guide': 'Study Guide - CampusGPT',
  '/dashboard': 'Dashboard - CampusGPT',
};

function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] ?? 'CampusGPT';
  }, [location.pathname]);
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-bg">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-bg">
        <LoadingSpinner size="md" label="Loading..." />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppLayout() {
  const location = useLocation();
  usePageTitle();

  const isChat = location.pathname === '/chat';

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg font-sans text-foreground antialiased">
      {!isChat && <OrbBg />}
      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex-1 pt-16 focus:outline-none"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/chat" element={<ProtectedRoute><ChatPortal /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizEngine /></ProtectedRoute>} />
          <Route path="/guide" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isChat && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
