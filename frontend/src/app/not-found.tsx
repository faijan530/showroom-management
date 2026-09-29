import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-white">404 - Page Not Found</h1>
      <p className="text-sm text-gray-400 max-w-md">
        The page or resource you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
