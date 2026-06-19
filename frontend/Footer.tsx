import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const productLinks: [string, string][] = [
  ['AI Chat', '/chat'],
  ['Quiz Generator', '/quiz'],
  ['Study Guides', '/guide'],
];

const companyLinks: [string, string][] = [
  ['About', '/about'],
  ['GitHub', 'https://github.com/mahamimran/campusgpt'],
];

export default function Footer() {
  const { user } = useAuth();

  const accountLinks: [string, string][] = user
    ? [['Dashboard', '/dashboard']]
    : [['Log in', '/login'], ['Register', '/register']];

  const footerCols = [
    { title: 'Product', links: productLinks },
    { title: 'Account', links: accountLinks },
    { title: 'Company', links: companyLinks },
  ];

  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-bg-elevated/80">
      <div className="page-container py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="CampusGPT home"
              className="mb-3 inline-block font-display text-lg font-bold text-foreground transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-cyan/50"
            >
              Campus<span className="text-cyan">GPT</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              An AI-powered learning platform for students: chat, quizzes, and personalized study guides in one place.
            </p>
          </div>

          {footerCols.map(col => (
            <nav key={col.title} aria-label={`${col.title} links`}>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted/70">
                {col.title}
              </h2>
              <ul className="space-y-2.5" role="list">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('http') ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-cyan/50"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        to={href}
                        className="text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-cyan/50"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CampusGPT · BSCS Semester Project</span>
          <span>Built for students, by students · SZABIST Islamabad</span>
        </div>
      </div>
    </footer>
  );
}
