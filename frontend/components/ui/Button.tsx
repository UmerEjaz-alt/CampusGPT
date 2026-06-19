import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  'aria-label'?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  to?: undefined;
  href?: undefined;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ButtonAsLink extends ButtonBaseProps {
  to: string;
  href?: undefined;
  type?: undefined;
  onClick?: undefined;
}

interface ButtonAsAnchor extends ButtonBaseProps {
  href: string;
  to?: undefined;
  type?: undefined;
  onClick?: undefined;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const variants: Record<Variant, string> = {
  primary: 'bg-white text-black shadow-sm hover:bg-white/90 active:bg-white/80',
  secondary: 'border border-white/10 bg-white/[0.025] text-foreground hover:border-white/20 hover:bg-white/[0.045] active:bg-white/[0.06]',
  ghost: 'bg-transparent text-muted hover:bg-white/[0.04] hover:text-foreground active:bg-white/[0.06]',
  gradient: 'bg-gradient-to-r from-cyan to-violet text-black shadow-[0_0_24px_rgba(56,217,245,0.22)] hover:shadow-[0_0_36px_rgba(56,217,245,0.32)] hover:opacity-95 active:opacity-90',
  danger: 'border border-pink/20 bg-transparent text-pink hover:border-pink/30 hover:bg-pink/[0.08] active:bg-pink/[0.12]',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'min-h-10 px-4 py-2.5 text-sm rounded-lg gap-2',
  lg: 'min-h-12 px-5 py-3 text-sm sm:text-base rounded-lg gap-2',
  xl: 'min-h-14 px-6 py-3.5 text-base rounded-lg gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center whitespace-nowrap font-semibold tracking-tight transition-all duration-200 select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    variants[variant],
    sizes[size],
    className,
  );

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes} aria-label={props['aria-label']}>
        {children}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    return (
      <a href={props.href} className={classes} target="_blank" rel="noreferrer" aria-label={props['aria-label']}>
        {children}
      </a>
    );
  }

  return (
    <motion.button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      transition={{ duration: 0.1 }}
      className={classes}
      aria-label={props['aria-label']}
    >
      {children}
    </motion.button>
  );
}
