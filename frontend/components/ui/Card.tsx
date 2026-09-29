import type { HTMLAttributes } from 'react';
import { cn } from './cn';
interface Props extends HTMLAttributes<HTMLElement> { hover?: boolean; padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'; glow?: string; as?: 'div' | 'article' | 'section' | 'li'; }
export default function Card({ children, className, hover, padding = 'md', glow, as: Tag = 'div', ...props }: Props) {
  return <Tag {...props} className={cn('card', 'card-' + padding, hover && 'card-hover', className)}>{children}</Tag>;
}

