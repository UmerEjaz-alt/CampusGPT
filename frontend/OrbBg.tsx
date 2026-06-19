import { motion } from 'framer-motion';

const orbs = [
  { 
    style: { backgroundColor: 'var(--violet)' }, 
    className: 'w-[550px] h-[550px] -top-48 -left-48 opacity-[0.06] blur-[120px]', 
    animate: { scale: [1, 1.12, 0.95, 1], x: [0, 40, -20, 0], y: [0, -30, 20, 0] },
    duration: 26 
  },
  { 
    style: { backgroundColor: 'var(--cyan)' }, 
    className: 'w-[480px] h-[480px] -bottom-36 -right-36 opacity-[0.05] blur-[110px]', 
    animate: { scale: [1, 0.92, 1.08, 1], x: [0, -30, 30, 0], y: [0, 40, -15, 0] },
    duration: 22 
  },
  { 
    style: { backgroundColor: 'var(--pink)' }, 
    className: 'w-[380px] h-[380px] top-1/3 right-1/4 opacity-[0.04] blur-[100px]', 
    animate: { scale: [1, 1.15, 0.9, 1], x: [0, 25, -35, 0], y: [0, 35, -25, 0] },
    duration: 32 
  },
];

export default function OrbBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg" aria-hidden="true">
      {/* Premium dark mesh overlay grid pattern texture (Optional, blends beautiful cyber lines into your background) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 mix-blend-overlay" />
      
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={orb.style}
          className={`absolute rounded-full will-change-transform ${orb.className}`}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}