import Button from './Button';
import { cn } from './cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'surface-card flex flex-col items-center px-6 py-12 text-center sm:px-8 sm:py-14',
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-2xl shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      )}
      {actionLabel && actionTo && (
        <div className="mt-6">
          <Button to={actionTo} variant="gradient" size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
