import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Showroom Application — Multi-Showroom Vehicle & Service Marketplace',
  description: 'Enterprise operational management and multi-showroom marketplace platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen flex flex-col">
        <Providers>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
