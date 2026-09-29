'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  UserPlus,
  Phone,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-gray-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.7)] space-y-7 animate-fade-up">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 shadow-xl shadow-emerald-500/25 border border-white/20 animate-float">
            <UserPlus className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200 tracking-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Join MotoHub marketplace for instant vehicle & service access
            </p>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Full Name</label>
            <div className="relative group">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Mobile Phone Number</label>
            <div className="relative group">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500 pl-1">10-digit mobile number used for login</p>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Email Address (Optional)</label>
            <div className="relative group">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">Confirm Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/30 transition-all text-xs sm:text-sm"
          >
            Create Customer Account <ArrowRight className="w-4 h-4 ml-1.5 inline" />
          </Button>

          {/* Guarantee Pill */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Access & Fully Encrypted Credentials</span>
          </div>

          {/* Footer Link */}
          <div className="pt-5 text-center text-xs text-gray-400 border-t border-white/[0.08]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors underline underline-offset-4">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

