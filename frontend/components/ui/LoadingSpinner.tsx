import { cn } from './cn';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ label, size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label || 'Loading'}
      className={cn('flex flex-col items-center justify-center gap-4', className)}
    >
      <div className={cn('relative', sizeMap[size])}>
        <div className="absolute inset-0 rounded-full border border-white/[0.05]" />
        <div
          className="absolute inset-0 rounded-full border-t-2 border-l-2 border-cyan"
          style={{ animation: 'spin 0.7s linear infinite' }}
        />
        {/* Inner glow dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-1 w-1 rounded-full bg-cyan/60" />
        </div>
      </div>
      {label && (
        <p className="text-sm font-medium text-muted max-w-xs text-center leading-relaxed">{label}</p>
      )}
    </div>
  );
}
