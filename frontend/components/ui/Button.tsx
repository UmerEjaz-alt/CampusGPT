import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; to?: string; href?: string; variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger'; size?: 'sm' | 'md' | 'lg' | 'xl' };
export default function Button({ children, to, href, variant = 'primary', size = 'md', className, disabled, ...props }: Props) {
  const classes = cn('button', 'button-' + (variant === 'gradient' ? 'primary' : variant), 'button-' + size, className);
  const content = <span className="button-content">{children}</span>;
  if (to || href) {
    if (disabled) return <span className={classes} aria-disabled="true">{content}</span>;
    return to ? <Link to={to} className={classes}>{content}</Link> : <a href={href} className={classes} target="_blank" rel="noreferrer">{content}</a>;
  }
  return <button type="button" {...props} disabled={disabled} className={classes}>{content}</button>;
}
