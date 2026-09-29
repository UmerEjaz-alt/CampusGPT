import type { ReactNode } from 'react';
export default function Badge({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: string; className?: string }) {
  return <span className={'badge badge-' + variant + ' ' + className}>{children}</span>;
}

