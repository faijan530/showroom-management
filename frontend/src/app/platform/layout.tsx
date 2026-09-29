'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PlatformHeader } from '@/components/layout/platform-header';
import { PlatformSidebar } from '@/components/layout/platform-sidebar';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/platform/login';

  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased flex flex-col">
      <PlatformHeader />
      <div className="flex flex-1">
        <PlatformSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
