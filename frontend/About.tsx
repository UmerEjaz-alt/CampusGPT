import { ArrowUpRight, Braces, Code2, Cpu, Database, Layers3, Lightbulb, PenTool, Server, ShieldCheck } from 'lucide-react';
import Button from './components/ui/Button';
import Reveal, { ScrollLines } from './components/ui/ScrollReveal';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import KnowledgeField from './components/ui/KnowledgeField';

const foundations = [
  [Lightbulb, 'The idea', 'A study tool should meet a student at the exact moment a question becomes a blocker.'],
  [PenTool, 'The experience', 'Every screen was shaped to make hard work feel focused, calm, and worth returning to.'],
  [Code2, 'The build', 'The interface, product logic, data flows, and AI integration were all developed as one connected system.'],
];

const architecture = [
  [Code2, 'The interface', 'React 19, TypeScript, Tailwind CSS, Framer Motion, and Vite'],
  [Server, 'The server', 'Node.js, Express.js, real-time SSE streaming, and PM2'],
  [Database, 'Your work', 'MongoDB and Mongoose for accounts, chats, quizzes, and guides'],
  [ShieldCheck, 'Access and validation', 'JWT authentication, bcrypt password hashing, Helmet, and Zod'],
  [Cpu, 'The AI', 'Groq inference with Llama 3.3 70B'],
];

export default function About() {
  const intro = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: introProgress } = useScroll({ target: intro, offset: ['start start', 'end start'] });
  const introY = useTransform(introProgress, [0, 1], [0, -60]);
  const introOpacity = useTransform(introProgress, [0, .8], [1, .25]);
  const { scrollYProgress: photoProgress } = useScroll({ target: photo, offset: ['start 95%', 'end 5%'] });
  const aperture = useTransform(photoProgress, [0, .4, 1], ['inset(12% 10% 12% 10%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']);
  const photoScale = useTransform(photoProgress, [0, 1], [1.3, 1.16]);
  const photoY = useTransform(photoProgress, [0, 1], ['-7%', '7%']);
  return <div className="about-page"><KnowledgeField className="about-field" density="medium" tint="brass" />
    <motion.section ref={intro} className="container about-intro" style={reduced ? undefined : { y: introY, opacity: introOpacity }}>
      <Reveal><p className="about-kicker">Independent product by Umer Ejaz</p><h1>Made alone.<br />Built for <em>many.</em></h1></Reveal>
      <div className="about-intro-bottom"><p>CampusGPT is a study space imagined, designed, and engineered end to end by one person: Umer Ejaz.</p><span>CampusGPT<br />Independent build</span></div>
    </motion.section>

    <motion.div ref={photo} className="about-photo" style={reduced ? undefined : { clipPath: aperture }}><motion.img style={reduced ? undefined : { scale: photoScale, y: photoY }} src="/images/library.jpg" alt="Open tables and bookshelves in a university library" /><span>Built for the moment a question needs somewhere to go.</span></motion.div>

    <section className="founder-section"><div className="container founder-grid">
      <Reveal><div className="founder-monogram" aria-hidden="true">UE</div></Reveal>
      <div className="founder-copy"><Reveal><p className="about-kicker">The maker</p><h2>Umer Ejaz<br /><em>Founder and builder.</em></h2></Reveal><Reveal delay={.08}><p className="large-copy">CampusGPT did not come from a committee. It came from one clear belief: students deserve an AI study tool that feels considered, capable, and genuinely useful.</p><p>From the first product thought to the final interaction, Umer shaped the brand, interface, frontend, backend architecture, data model, and AI experience. It is a personal build with a broad ambition: make learning feel less solitary.</p></Reveal></div>
    </div></section>

    <section className="maker-section"><div className="container"><Reveal><div className="maker-heading"><p className="about-kicker">One point of view</p><ScrollLines lines={["One builder.", "The whole picture."]} /></div></Reveal><div className="maker-grid">{foundations.map(([Icon, title, description], index) => <Reveal key={title} delay={index * .06}><article><Icon size={20} /><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article></Reveal>)}</div></div></section>

    <section className="container architecture-section"><div><p className="about-kicker">Under the surface</p><ScrollLines lines={["Built with care.", "From front to back."]} /><p>Each part has a clear job. The browser keeps the workspace immediate; the server keeps the AI requests secure; the system stays focused on the student.</p></div><div className="architecture-list">{architecture.map(([Icon, title, description]: any, index) => <Reveal key={title} delay={index * .06}><article><Icon size={20} /><div><h3>{title}</h3><p>{description}</p></div></article></Reveal>)}</div></section>

    <section className="about-flow container"><p className="about-kicker">The product loop</p><h2>From a question<br />to clarity.</h2><ol><li><Braces /><h3>You ask</h3><p>The browser sends your question into your workspace.</p></li><li><Server /><h3>The system connects</h3><p>The request stays protected on the server.</p></li><li><Cpu /><h3>The AI responds</h3><p>Tokens stream back into the conversation in real time.</p></li><li><Layers3 /><h3>Your work continues</h3><p>Your progress, chats, quizzes, and guides stay connected.</p></li></ol></section>

    <section className="container about-cta"><div><p className="about-kicker">The work is for you</p><ScrollLines lines={["Make your next", "study session count."]} /></div><Button to="/chat" size="lg">Start a conversation <ArrowUpRight size={18} /></Button></section>
  </div>;
}
