// src/features/seller/category/ui/Badge.tsx

import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'inactive' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ 
  variant = 'default', 
  children, 
  className = '' 
}: BadgeProps) {
  const variants = {
    success: 'bg-success-100 text-success-700 border border-success-200',
    error: 'bg-error-100 text-error-700 border border-error-200',
    warning: 'bg-warning-100 text-warning-700 border border-warning-200',
    inactive: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    default: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}