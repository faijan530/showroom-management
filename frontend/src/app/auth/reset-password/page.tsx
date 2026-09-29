'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast('error', 'Passwords do not match');
      return;
    }

    if (!token) {
      toast('error', 'Invalid or missing password reset token');
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean backend integration point for POST /api/auth/reset-password
      toast('info', 'Password reset endpoint (/api/auth/reset-password) is pending backend token verification service integration.');
    } catch (err: any) {
      toast('error', err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <Card glass className="w-full max-w-md shadow-2xl border-gray-800">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-black">Set New Password</CardTitle>
          <CardDescription>
            Choose a strong password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {!token && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Reset token is missing in URL parameter. Please request a new reset link.</span>
              </div>
            )}

            <Button variant="primary" size="lg" className="w-full mt-2" isLoading={isSubmitting}>
              Update Password
            </Button>

            <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-800/80">
              <Link href="/auth/login" className="inline-flex items-center gap-1 text-gray-400 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
