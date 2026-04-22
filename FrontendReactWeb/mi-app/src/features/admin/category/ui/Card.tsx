// src/features/seller/category/ui/Card.tsx

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// src/features/seller/category/ui/Card.tsx

export function Card({ children, className = '', ...props }: any) {
  return (
    <div
      className={`bg-white rounded-3xl border border-neutral-100 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}