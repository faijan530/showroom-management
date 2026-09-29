'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Clean backend integration point for POST /api/auth/forgot-password
      toast('info', 'Password recovery endpoint (/api/auth/forgot-password) is pending backend email service integration.');
    } catch (err: any) {
      toast('error', err.message || 'Failed to process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <Card glass className="w-full max-w-md shadow-2xl border-gray-800">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-black">Reset Password</CardTitle>
          <CardDescription>
            Enter your registered email address to receive password recovery instructions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Password recovery email dispatch requires backend mail server configuration.</span>
            </div>

            <Button variant="primary" size="lg" className="w-full mt-2" isLoading={isSubmitting}>
              Send Reset Link
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
