import type { ReactNode } from 'react';
export default function SectionHeader({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return <header className="section-header"><h2>{title}</h2>{description && <p>{description}</p>}</header>;
}

