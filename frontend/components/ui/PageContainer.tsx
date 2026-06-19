import { cn } from './cn';

interface PageContainerProps {
  children: React.ReactNode;
  narrow?: boolean;
  full?: boolean;
  className?: string;
}

export default function PageContainer({ children, narrow = false, full = false, className }: PageContainerProps) {
  const variant = full ? 'page-container-full' : narrow ? 'page-container-narrow' : 'page-container';
  return (
    <div className={cn(variant, className)}>
      {children}
    </div>
  );
}
