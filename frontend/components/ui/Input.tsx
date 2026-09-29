import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';
interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> { label?: string; error?: string; hint?: string; size?: 'md' | 'lg'; trailing?: ReactNode; }
const Input = forwardRef<HTMLInputElement, Props>(({ label, error, hint, id, className, size = 'md', trailing, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  return <div className="field">
    {label && <label htmlFor={inputId}>{label}</label>}
    <div className="field-control">
      <input {...props} ref={ref} id={inputId} className={cn('input', trailing && 'input-trailing', className)}
        aria-invalid={Boolean(error)} aria-describedby={[props['aria-describedby'], error ? inputId + '-error' : hint ? inputId + '-hint' : ''].filter(Boolean).join(' ') || undefined} />
      {trailing && <div className="field-trailing">{trailing}</div>}
    </div>
    {error && <p id={inputId + '-error'} role="alert" className="field-error">{error}</p>}
    {hint && !error && <p id={inputId + '-hint'} className="field-hint">{hint}</p>}
  </div>;
});
Input.displayName = 'Input';
export default Input;

