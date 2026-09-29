import type { ReactNode } from 'react';
export default function PageContainer({ children, narrow, full, className = '' }: { children: ReactNode; narrow?: boolean; full?: boolean; className?: string }) {
  return <div className={(narrow ? 'container-narrow' : 'container') + ' ' + className}>{children}</div>;
}

