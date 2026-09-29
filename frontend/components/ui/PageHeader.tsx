import type { ReactNode } from 'react';
export default function PageHeader({ title, description, children, className = '' }: { title: ReactNode; description?: ReactNode; children?: ReactNode; className?: string }) {
  return <header className={'page-header ' + className}><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</header>;
}

