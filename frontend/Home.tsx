import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ListChecks, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';
import Button from './components/ui/Button';
import KnowledgeField from './components/ui/KnowledgeField';
import Reveal, { ScrollLines } from './components/ui/ScrollReveal';

const tools = [
  { title: 'Ask without losing the thread.', label: 'Study chat', icon: MessageSquare, to: '/chat', description: 'Work through an idea in a conversation that holds onto the context and makes room for the next question.' },
  { title: 'Make recall feel alive.', label: 'Practice', icon: ListChecks, to: '/quiz', description: 'Generate a quiz around the material you are actually studying, then use the explanations to tighten the gaps.' },
  { title: 'Turn momentum into a plan.', label: 'Study plans', icon: BookOpen, to: '/guide', description: 'Give an ambitious topic shape: daily topics, focused tasks, and a visible sense of what comes next.' },
];

function StudyInstrument({ active }: { active: number }) {
  return <div className="study-instrument" aria-label="Illustrative CampusGPT study workspace">
    <div className="instrument-rail"><span>CG</span><i /><i /><i /></div>
    <div className="instrument-content">
      <header><span>Learning field / Data structures</span><span>Illustrative workspace</span></header>
      <AnimatePresence mode="wait">
        <motion.div key={active} className="instrument-panel" initial={{ opacity: 0, filter: 'blur(6px)', y: 16 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} exit={{ opacity: 0, filter: 'blur(6px)', y: -12 }} transition={{ duration: .4, ease: [0.22, 1, 0.36, 1] }}>
          {active === 0 && <>
            <div className="instrument-message user">Why does binary search feel so much faster?</div>
            <div className="instrument-message assistant"><span className="message-mark">01</span><div><h3>Because every decision removes half the work.</h3><p>Start in the middle. Each comparison tells you which half cannot contain the answer, so the remaining space collapses fast.</p><div className="instrument-sequence"><span>32</span><span>16</span><span>8</span><span>4</span><strong>2</strong></div></div></div>
            <div className="instrument-composer">What if the data is unsorted?<ArrowUpRight size={16} /></div>
          </>}
          {active === 1 && <>
            <p className="instrument-overline">Question 02 / 05</p><h3 className="instrument-question">What is the time complexity of binary search?</h3>
            <div className="instrument-options">{['O(n)', 'O(log n)', 'O(n²)', 'O(1)'].map((option, index) => <div key={option} className={index === 1 ? 'is-correct' : ''}><span>{String.fromCharCode(65 + index)}</span>{option}{index === 1 && <Check size={16} />}</div>)}</div>
            <p className="instrument-note">The search space is halved with each comparison.</p>
          </>}
          {active === 2 && <>
            <p className="instrument-overline">A 7-day route through</p><h3 className="instrument-question">From first principles to practice.</h3>
            <div className="instrument-days">{['Arrays and linked lists', 'Stacks and queues', 'Trees and search', 'Practice and review'].map((day, index) => <div key={day}><span>{index < 2 ? <Check size={14} /> : index + 1}</span><p><small>Day {index + 1}</small>{day}</p><em>{index < 2 ? 'Done' : index === 2 ? 'Next' : ''}</em></div>)}</div>
          </>}
        </motion.div>
      </AnimatePresence>
    </div>
  </div>;
}

export default function Home() {
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);
  const heroOpacity = useTransform(scrollYProgress, [0, .45, .9], [1, 1, 0]);
  const heroBlur = useTransform(scrollYProgress, [.25, 1], ['blur(0px)', 'blur(5px)']);
  const { scrollYProgress: stageProgress } = useScroll({ target: stageRef, offset: ['start 90%', 'center 45%'] });
  const sceneRotate = useTransform(stageProgress, [0, 1], [12, 0]);
  const sceneY = useTransform(stageProgress, [0, 1], [90, 0]);
  const sceneScale = useTransform(stageProgress, [0, 1], [.88, 1]);

  return <div className="cinema-home">
    <section ref={heroRef} className="cinema-hero">
      <motion.div className="cinema-hero-image" style={reduceMotion ? {} : { y: imageY, scale: imageScale }}><img src="/images/library.jpg" alt="A university library filled with books and places to think" fetchPriority="high" /></motion.div>
      <div className="cinema-hero-wash" />
      <KnowledgeField className="hero-field" density="high" tint="ivory" />
      <motion.div className="cinema-hero-content container" style={reduceMotion ? {} : { y: contentY, opacity: heroOpacity, filter: heroBlur }}>
        <div className="hero-topline"><span>CampusGPT / Study intelligence</span><span>Islamabad, PK</span></div>
        <div className="hero-thesis">
          <p>For the moments<br />your thinking opens up.</p>
          <h1>CampusGPT<span className="hero-subtitle">Space to <em>understand.</em></span></h1>
          <div className="hero-thesis-bottom"><p>Work through a question, test your understanding, and plan what to learn next.</p><Button to={user ? '/dashboard' : '/register'} size="lg">{user ? 'Open workspace' : 'Start learning'} <ArrowUpRight size={18} /></Button></div>
        </div>
        <div className="hero-coordinate"><span>01</span><span>Conversations<br />Practice<br />Plans</span></div>
      </motion.div>
      <a className="hero-scroll-cue" href="#manifesto" aria-label="Explore CampusGPT"><span>Scroll to explore</span><ArrowDown size={16} /></a>
    </section>

    <section id="manifesto" className="manifesto-band">
      <div className="container manifesto-grid">
        <Reveal><p className="manifesto-lead">A good study session has a pulse.</p></Reveal>
        <Reveal delay={.12}><div><ScrollLines lines={["Make the hard parts", "feel possible again."]} /><p>CampusGPT brings together the ways learning actually moves: a question, a practical check, a plan for returning tomorrow. Not more noise. A clearer line through the work.</p><Link to={user ? '/dashboard' : '/register'} className="editorial-link">Find your starting point <ArrowRight size={16} /></Link></div></Reveal>
      </div>
    </section>

    <section ref={stageRef} className="instrument-stage">
      <KnowledgeField className="stage-field" density="medium" tint="brass" />
      <div className="container instrument-layout">
        <Reveal className="instrument-copy"><p className="section-index">One place, three ways forward.</p><h2>The workbench<br />for your <em>curiosity.</em></h2><p>Choose the kind of progress you need now. The system changes shape; your momentum stays intact.</p><div className="instrument-tabs" role="tablist" aria-label="CampusGPT tools">{tools.map((tool, index) => <button key={tool.label} className={active === index ? 'active' : ''} role="tab" aria-selected={active === index} id={'study-tab-' + index} tabIndex={active === index ? 0 : -1} aria-controls="study-instrument" onKeyDown={event => {
          const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % tools.length
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index + tools.length - 1) % tools.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? tools.length - 1 : null;
          if (next === null) return;
          event.preventDefault();
          setActive(next);
          document.getElementById('study-tab-' + next)?.focus();
        }} onClick={() => setActive(index)}><span><tool.icon size={17} /> {tool.label}</span><ArrowUpRight size={16} /></button>)}</div><Link className="editorial-link" to={user ? tools[active].to : '/register'}>Open {tools[active].label.toLowerCase()} <ArrowRight size={16} /></Link></Reveal>
        <motion.div className="instrument-scene" style={reduceMotion ? undefined : { rotateX: sceneRotate, y: sceneY, scale: sceneScale }} id="study-instrument" role="tabpanel" aria-labelledby={'study-tab-' + active} tabIndex={0} initial={false} animate={{ rotate: active === 1 ? 1 : active === 2 ? -1 : 0 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}><StudyInstrument active={active} /><span className="scene-caption">CampusGPT / {tools[active].label}</span></motion.div>
      </div>
    </section>

    <section className="learning-ritual container">
      <Reveal><ScrollLines lines={["Not a productivity ritual.", "A thinking ritual."]} /></Reveal>
      <div className="ritual-steps">{[
        ['Bring the unfinished thought', 'A whole course, one stubborn concept, or the question that interrupted your reading.'],
        ['Give it a shape', 'Talk, test, or make a day-by-day route through it without losing the original thread.'],
        ['Return with more context', 'Your work is waiting when you are ready to pick it up again.'],
      ].map(([title, description], index) => <Reveal key={title} delay={index * .1}><article><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article></Reveal>)}</div>
    </section>

    <section className="campus-origin">
      <div className="container origin-grid"><Reveal><p className="section-index">Made close to the study table.</p><h2>One builder.<br /><em>Many ways</em><br />to learn.</h2></Reveal><Reveal delay={.1}><div className="origin-note"><Sparkles size={18} /><p>The chapter that does not click. The first moment something finally makes sense. Umer Ejaz built CampusGPT independently, from the interface to the AI integration, for these moments.</p><span>Designed and developed by Umer Ejaz</span><Link to="/about" className="editorial-link">Meet the creator <ArrowUpRight size={16} /></Link></div></Reveal></div>
    </section>

    <section className="cinema-close">
      <KnowledgeField className="close-field" density="high" tint="ivory" />
      <div className="container close-content"><p>There is always another way in.</p><ScrollLines lines={["What do you want", "to understand?"]} /><Button to={user ? '/dashboard' : '/register'} size="lg">Start with a question <ArrowUpRight size={18} /></Button></div>
    </section>
  </div>;
}
