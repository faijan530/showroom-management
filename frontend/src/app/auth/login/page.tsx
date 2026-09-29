'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  ShieldCheck,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Compass,
} from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-md bg-gray-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.7)] space-y-8 animate-fade-up">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-xl shadow-blue-500/25 border border-white/20 animate-float">
            <Compass className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-50 to-indigo-200 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Sign in to manage bookings, track requests, and access your dashboard
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">
              Mobile Phone Number
            </label>
            <div className="relative group">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500 pl-1">Enter your registered 10-digit mobile number</p>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <label>Password</label>
              <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all text-xs sm:text-sm"
          >
            Sign In to Account <ArrowRight className="w-4 h-4 ml-1.5 inline" />
          </Button>

          {/* Guarantee / Security Pill */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Encrypted Multi-Tenant Security</span>
          </div>

          {/* Footer Link */}
          <div className="pt-5 text-center text-xs text-gray-400 border-t border-white/[0.08]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline underline-offset-4">
              Create an Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

