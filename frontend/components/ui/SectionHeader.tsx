import { cn } from './cn';
import Badge from './Badge';

interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: 'default' | 'cyan' | 'violet' | 'pink' | 'green' | 'amber';
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeVariant = 'default',
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-10 sm:mb-12', align === 'center' && 'text-center', className)}>
      {badge && (
        <div className="mb-3">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <h2 className="text-balance font-display text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
