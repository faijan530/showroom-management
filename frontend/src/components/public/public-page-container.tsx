import React from 'react';

interface PublicPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PublicPageContainer({ children, className = '' }: PublicPageContainerProps) {
  return (
    <div className={`max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 space-y-8 ${className}`}>
      {children}
    </div>
  );
}
