import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from './AuthContext';
export default function Footer() {
  const { user } = useAuth();
  return <footer className="site-footer"><div className="container">
    <div className="footer-top"><Link className="footer-wordmark" to="/">CampusGPT/</Link><p>Study intelligence for<br />the work in progress.</p></div>
    <div className="footer-links"><nav aria-label="Study tools"><Link to="/chat">AI chat</Link><Link to="/quiz">Practice quizzes</Link><Link to="/guide">Study plans</Link></nav><nav aria-label="Project"><Link to="/about">About the project</Link><a href="https://github.com/mahamimran/campusgpt" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a><Link to={user ? '/dashboard' : '/login'}>{user ? 'Your workspace' : 'Log in'}</Link></nav></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} CampusGPT</span><span>Independently built by Umer Ejaz.</span><a href="#main-content">Back to top</a></div>
  </div></footer>;
}
