import React from 'react';

interface PublicPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PublicPageContainer({ children, className = '' }: PublicPageContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${className}`}>
      {children}
    </div>
  );
}
