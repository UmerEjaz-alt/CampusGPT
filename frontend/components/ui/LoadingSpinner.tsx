import { LoaderCircle } from 'lucide-react';
export default function LoadingSpinner({ label = 'Loading...', size = 'md', className = '' }: { label?: string; size?: string; className?: string }) {
  return <div role="status" className={'loading ' + className}><LoaderCircle className="spinner" size={size === 'sm' ? 18 : 28} aria-hidden="true" /><span>{label}</span></div>;
}

