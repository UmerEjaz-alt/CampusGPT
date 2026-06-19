import { forwardRef } from 'react';
import { cn } from './cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'md' | 'lg';
}

const sizeStyles = {
  md: 'min-h-11 px-4 py-3 text-sm',
  lg: 'min-h-12 px-5 py-3.5 text-sm',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, size = 'md', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full rounded-lg border border-white/[0.08] bg-bg-subtle',
            'text-foreground outline-none transition-all duration-200',
            'placeholder:text-muted-subtle/80',
            'focus:border-cyan/40 focus:bg-bg-elevated focus:ring-2 focus:ring-cyan/15',
            'focus-visible:outline-none',
            sizeStyles[size],
            error && 'border-pink/30 focus:border-pink/40 focus:ring-pink/15',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-pink">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
