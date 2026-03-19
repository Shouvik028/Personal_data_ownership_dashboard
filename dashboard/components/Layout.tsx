import { ReactNode } from 'react';
import NavBar from './NavBar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            )}
            {description && (
              <p className="text-slate-400 text-sm">{description}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
