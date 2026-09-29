'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const register = useAuthStore((state) => state.register);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length !== 10) {
      toast('error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (password !== confirmPassword) {
      toast('error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast('error', 'Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ full_name: fullName, phone: cleanPhone, email: email || undefined, password });
      toast('success', 'Account created successfully!');
      router.push('/');
    } catch (err: any) {
      toast('error', err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <Card glass className="w-full max-w-md shadow-2xl border-gray-800">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-black">Create Customer Account</CardTitle>
          <CardDescription>
            Join the Multi-Showroom Vehicle & Service Marketplace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="10-digit mobile number used for login"
              required
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button variant="primary" size="lg" className="w-full mt-2" isLoading={isSubmitting}>
              Create Account
            </Button>

            <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-800/80">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
