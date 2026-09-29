import React from 'react';

export interface PageWrapperProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function PageWrapper({ title, description, action, children }: PageWrapperProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
