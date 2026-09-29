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
  Sparkles,
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
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden bg-[#070a12]">
      {/* Background Glow Accents matching landing page */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card Container matching page cards */}
      <div className="relative z-10 w-full max-w-lg bg-gradient-to-br from-gray-900/90 via-gray-950 to-[#0c1220] border border-gray-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 animate-fade-up">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/25 border border-blue-400/20">
            <UserPlus className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JOIN MOTOHUB MARKETPLACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight pt-1">
              Create Customer Account
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Register to book vehicle services, request test drives, and buy OEM parts
            </p>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Full Name</label>
            <div className="relative group">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Mobile Phone Number</label>
            <div className="relative group">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500 pl-1">10-digit mobile number used for login</p>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Email Address (Optional)</label>
            <div className="relative group">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">Confirm Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
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
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/20 transition-all text-xs sm:text-sm mt-2"
          >
            Create Account <ArrowRight className="w-4 h-4 ml-1.5 inline" />
          </Button>

          {/* Guarantee Pill */}
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Instant Public Marketplace Browsing & Secured Data</span>
          </div>

          {/* Footer Link */}
          <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-800/80">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline underline-offset-4">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


