import { cn } from './cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'violet' | 'green' | 'pink' | 'amber';
  className?: string;
}

const variants = {
  default: 'border-white/10 bg-white/[0.03] text-muted',
  cyan:    'border-cyan/20 bg-cyan/[0.07] text-cyan',
  violet:  'border-violet/20 bg-violet/[0.07] text-violet',
  green:   'border-green/20 bg-green/[0.07] text-green',
  pink:    'border-pink/20 bg-pink/[0.07] text-pink',
  amber:   'border-amber/20 bg-amber/[0.07] text-amber',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full border px-3 py-1',
        'text-[11px] font-bold uppercase tracking-widest',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
