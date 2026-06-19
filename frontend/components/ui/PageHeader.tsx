import Badge from './Badge';
import { cn } from './cn';

interface PageHeaderProps {
  badge?: string;
  badgeVariant?: 'default' | 'cyan' | 'violet' | 'pink' | 'green' | 'amber';
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export default function PageHeader({
  badge,
  badgeVariant = 'default',
  title,
  description,
  align = 'center',
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-10',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {badge && (
        <div className="mb-4">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <h1 className="text-balance font-display text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            'mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </header>
  );
}
