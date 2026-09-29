import type { ReactNode } from 'react';
import Button from './Button';
export default function EmptyState({ icon, title, description, actionLabel, actionTo, className = '' }: { icon?: ReactNode; title: string; description?: string; actionLabel?: string; actionTo?: string; className?: string }) {
  return <div className={'empty-state ' + className}>{icon}<h3>{title}</h3>{description && <p>{description}</p>}{actionLabel && actionTo && <Button to={actionTo} variant="secondary">{actionLabel}</Button>}</div>;
}

