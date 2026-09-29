'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ShieldCheck, Phone, Lock } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      toast('error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!password) {
      toast('error', 'Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({ phone: cleanPhone, password });
      toast('success', `Welcome back, ${user.full_name}!`);

      switch (user.role) {
        case 'SUPERADMIN':
          router.push('/platform/dashboard');
          break;
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'INVENTORY_MANAGER':
          router.push('/inventory/dashboard');
          break;
        case 'WORKER':
          router.push('/worker/dashboard');
          break;
        default:
          router.push('/');
          break;
      }
    } catch (err: any) {
      toast('error', err.message || 'Failed to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <Card glass className="w-full max-w-md shadow-2xl border-gray-800">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-black">Account Login</CardTitle>
          <CardDescription>
            Enter your 10-digit phone number and password to sign in
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="10-digit mobile number"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-gray-900 border-gray-800 text-blue-600 focus:ring-0" />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button variant="primary" size="lg" className="w-full mt-2" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
