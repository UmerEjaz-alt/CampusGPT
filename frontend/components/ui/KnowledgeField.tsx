import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

type KnowledgeFieldProps = {
  className?: string;
  density?: 'low' | 'medium' | 'high';
  tint?: 'ivory' | 'brass';
};

type Node = { phase: number; orbit: number; speed: number; drift: number; size: number };

/** A deliberately subtle Canvas field: animated evidence of ideas connecting, not decoration. */
export default function KnowledgeField({ className = '', density = 'medium', tint = 'ivory' }: KnowledgeFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let visible = true;
    let width = 1;
    let height = 1;
    let nodes: Node[] = [];
    const amount = density === 'high' ? 96 : density === 'low' ? 44 : 68;
    const ink = tint === 'brass' ? [202, 158, 88] : [238, 232, 215];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      nodes = Array.from({ length: Math.round(amount * Math.min(1.2, Math.max(.55, width / 1200)) ) }, (_, index) => ({
        phase: (index / amount) * Math.PI * 2 + Math.random() * .45,
        orbit: .14 + Math.random() * .72,
        speed: .05 + Math.random() * .13,
        drift: .2 + Math.random() * .8,
        size: Math.random() > .9 ? 1.8 : .8 + Math.random() * .55,
      }));
      if (reduceMotion) draw(0);
    };

    const coordinate = (node: Node, time: number) => {
      const cx = width * .56;
      const cy = height * .52;
      const xRadius = width * node.orbit * .64;
      const yRadius = height * node.orbit * .3;
      const angle = node.phase + time * node.speed;
      return {
        x: cx + Math.cos(angle) * xRadius + Math.sin(time * .15 + node.phase * 3) * 28 * node.drift,
        y: cy + Math.sin(angle * 1.42) * yRadius + Math.cos(time * .11 + node.phase) * 18 * node.drift,
      };
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const positions = nodes.map(node => coordinate(node, time));
      context.lineWidth = .65;

      for (let i = 0; i < positions.length; i += 1) {
        const current = positions[i];
        for (let j = i + 1; j < positions.length; j += 1) {
          const next = positions[j];
          const distance = Math.hypot(current.x - next.x, current.y - next.y);
          const limit = Math.min(width, height) * .2;
          if (distance < limit) {
            const alpha = (1 - distance / limit) * .16;
            context.strokeStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${alpha})`;
            context.beginPath();
            context.moveTo(current.x, current.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          }
        }
      }

      positions.forEach((position, index) => {
        context.fillStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${index % 9 === 0 ? .72 : .34})`;
        context.beginPath();
        context.arc(position.x, position.y, nodes[index].size, 0, Math.PI * 2);
        context.fill();
      });

      // A slow set of elliptical trajectories gives the field an authored focal point.
      for (let arc = 0; arc < 3; arc += 1) {
        context.strokeStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${.08 - arc * .016})`;
        context.lineWidth = .8;
        context.beginPath();
        context.ellipse(width * .56, height * .52, width * (.18 + arc * .12), height * (.09 + arc * .055), -.16 + arc * .14, 0, Math.PI * 2);
        context.stroke();
      }
    };

    const render = (timestamp: number) => {
      draw(timestamp / 1000);
      if (!reduceMotion && visible && !document.hidden) frame = requestAnimationFrame(render);
    };

    const resume = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden) render(performance.now());
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    visibility.observe(canvas);
    document.addEventListener('visibilitychange', resume);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    render(0);
    return () => { observer.disconnect(); visibility.disconnect(); document.removeEventListener('visibilitychange', resume); cancelAnimationFrame(frame); };
  }, [density, reduceMotion, tint]);

  return <canvas ref={canvasRef} className={'knowledge-field ' + className} aria-hidden="true" />;
}
