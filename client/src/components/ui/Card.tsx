import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  accent?: 'sky' | 'green' | 'amber' | 'red' | 'violet';
}

const accents = {
  sky: 'border-t-sky-500',
  green: 'border-t-green-400',
  amber: 'border-t-amber-400',
  red: 'border-t-red-400',
  violet: 'border-t-violet-500',
};

export function Card({ children, className = '', accent }: CardProps) {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-5 ${accent ? `border-t-2 ${accents[accent]}` : ''} hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-shadow ${className}`}>
      {children}
    </div>
  );
}
