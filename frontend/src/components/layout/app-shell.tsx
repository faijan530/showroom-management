'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Platform routes use PlatformLayout in app/platform/layout.tsx
  if (pathname.startsWith('/platform')) {
    return <>{children}</>;
  }

  // Define Public routes that MUST NOT render the authenticated sidebar
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/vehicles' ||
    pathname.startsWith('/vehicles/') ||
    pathname === '/spare-parts' ||
    pathname.startsWith('/spare-parts/') ||
    pathname === '/showrooms' ||
    pathname.startsWith('/showrooms/') ||
    pathname === '/about' ||
    pathname.startsWith('/auth') ||
    pathname === '/customer/services';

  // Public Layout: Top Navbar + Main Content + Footer (NO Sidebar)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a12] text-gray-100">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </div>
    );
  }

  // Authenticated Dashboard Shell Layout: Top Navbar + App Sidebar + Container Main + Footer
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-[1440px] 2xl:max-w-[1536px] mx-auto w-full">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
