import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/** Scrub a section into place with native scroll; never intercept wheel or touch. */
export default function ScrollReveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 96%', 'start 42%'] });
  const start = Math.min(delay, .3);
  const y = useTransform(scrollYProgress, [start, 1], [48, 0]);
  const opacity = useTransform(scrollYProgress, [start, .8], [.45, 1]);
  const rotateX = useTransform(scrollYProgress, [start, 1], [6, 0]);
  return <motion.div ref={ref} className={'scroll-reveal ' + className} style={reduced ? undefined : { y, opacity, rotateX, transformOrigin: '50% 100%' }}>{children}</motion.div>;
}

export function ScrollLines({ lines, className = '' }: { lines: string[]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'end 48%'] });
  return <h2 ref={ref} className={'scroll-lines ' + className}>{lines.map((line, index) => <ScrollLine key={line} text={line} index={index} total={lines.length} progress={scrollYProgress} />)}</h2>;
}

function ScrollLine({ text, index, total, progress }: { text: string; index: number; total: number; progress: import('framer-motion').MotionValue<number> }) {
  const reduced = useReducedMotion();
  const y = useTransform(progress, [index / (total + 1), (index + 2) / (total + 1)], ['100%', '0%']);
  const rotate = useTransform(progress, [index / (total + 1), (index + 2) / (total + 1)], [4, 0]);
  return <span className="scroll-line-mask"><motion.span style={reduced ? undefined : { y, rotate, transformOrigin: '0% 100%' }}>{index === total - 1 ? <em>{text}</em> : text}</motion.span></span>;
}
