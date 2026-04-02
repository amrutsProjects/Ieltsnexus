import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-3xl p-5 border border-[#F1F5F9] ${className}`}
      style={{
        boxShadow: glow 
          ? '0px 4px 24px rgba(79, 70, 229, 0.12), 0px 0px 0px 1px rgba(79, 70, 229, 0.08)'
          : '0px 4px 24px rgba(0,0,0,0.06)'
      }}
    >
      {children}
    </div>
  );
}
