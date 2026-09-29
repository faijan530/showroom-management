'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

export default function PlatformLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, logout } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast('error', 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      setIsLoading(false);
      return;
    }

    try {
      const user = await login({ phone: cleanPhone, password });

      if (user.role !== 'SUPERADMIN') {
        await logout();
        toast('error', 'Access denied: Only SUPERADMIN accounts can log in to the Platform Control Center.');
        setIsLoading(false);
        return;
      }

      toast('success', `Welcome back, ${user.full_name}! Platform Control Center active.`);
      router.push('/platform/dashboard');
    } catch (err: any) {
      toast('error', err.message || 'Platform login failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-700 shadow-xl shadow-rose-600/30">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Control Center</h1>
          <p className="text-sm text-gray-400">Superadmin Authentication Portal</p>
        </div>

        <Card glass className="border-rose-900/40">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Superadmin Sign In</CardTitle>
            <CardDescription className="text-xs text-rose-300/80">
              Restricted portal. Only global platform administrators may log in here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Mobile Phone Number"
                type="text"
                placeholder="10-digit phone number (e.g. 9999999999)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                label="Superadmin Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                variant="primary"
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 shadow-lg shadow-rose-600/20"
                isLoading={isLoading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Platform
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
              <Link href="/auth/login" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Showroom User Login
              </Link>
              <span className="text-gray-600">•</span>
              <span className="text-rose-400/80 font-mono text-[11px]">SUPERADMIN SCOPE</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
