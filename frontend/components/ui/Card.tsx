import { cn } from './cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  glow?: 'cyan' | 'violet' | 'pink' | 'green' | 'none';
  as?: 'div' | 'article' | 'section' | 'li';
}

const paddingMap = {
  none: '',
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const glowMap = {
  none:   '',
  cyan:   'hover:shadow-[0_0_28px_rgba(56,217,245,0.1)] hover:border-[rgba(56,217,245,0.2)]',
  violet: 'hover:shadow-[0_0_28px_rgba(162,89,255,0.1)] hover:border-[rgba(162,89,255,0.2)]',
  pink:   'hover:shadow-[0_0_28px_rgba(244,114,182,0.1)] hover:border-[rgba(244,114,182,0.2)]',
  green:  'hover:shadow-[0_0_28px_rgba(52,211,153,0.1)]  hover:border-[rgba(52,211,153,0.2)]',
};

export default function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  glow = 'none',
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={cn(
        hover ? 'surface-card-interactive' : 'surface-card',
        'min-w-0',
        paddingMap[padding],
        hover && glow !== 'none' && glowMap[glow],
        hover && 'transition-all duration-200',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
