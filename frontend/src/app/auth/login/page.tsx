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
    <div className="relative min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden bg-[#070a12]">
      {/* Background Glow Accents matching landing page */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card Container matching page cards */}
      <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900/90 via-gray-950 to-[#0c1220] border border-gray-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-7 animate-fade-up">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/25 border border-blue-400/20">
            <Compass className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SECURE ACCESS PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight pt-1">
              Account Sign In
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enter your mobile number and password to access MotoHub
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">
              Mobile Phone Number
            </label>
            <div className="relative group">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="tel"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          {/* Password Input */}
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
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300 transition-colors"
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
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/20 transition-all text-xs sm:text-sm mt-2"
          >
            Sign In <ArrowRight className="w-4 h-4 ml-1.5 inline" />
          </Button>

          {/* Footer Link */}
          <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-800/80">
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


