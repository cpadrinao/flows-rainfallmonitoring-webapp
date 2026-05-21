'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ShieldAlert, ArrowLeft, Radio, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('flows_admin_logged_in');
    if (isLoggedIn === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate server latency
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('flows_admin_logged_in', 'true');
        localStorage.setItem('flows_admin_user', username);
        localStorage.setItem('flows_last_login', new Date().toLocaleString());
        router.push('/admin/dashboard');
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="bg-[#0b0f19] min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#60A5FA] blur-[150px] opacity-5 pointer-events-none -translate-x-40" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#A78BFA] blur-[150px] opacity-5 pointer-events-none translate-x-40" />
      {/* Main card */}
      <div className="w-full max-w-md bg-[#1F2937]/90 border border-[#374151] rounded-3xl p-8 shadow-2xl backdrop-blur-md relative z-10 weather-glow-blue animate-fade-in">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#60A5FA] transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Resident App</span>
          </Link>
        </div>

        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-2xl text-[#60A5FA] mb-3">
            <ShieldAlert size={36} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            F.L.O.W.S.
            <span className="text-xs bg-[#60A5FA]/20 text-[#60A5FA] px-2 py-0.5 rounded font-black tracking-widest uppercase">Admin</span>
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1 font-medium">
            Barangay Rizal Rainfall Monitoring Telemetry Console
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-3 flex items-start gap-2 text-xs text-[#EF4444] animate-pulse">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#9CA3AF]">
                <User size={16} />
              </span>
              <input 
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#111827] border border-[#374151] focus:border-[#60A5FA] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#4B5563] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#9CA3AF]">
                <Lock size={16} />
              </span>
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111827] border border-[#374151] focus:border-[#60A5FA] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#4B5563] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#60A5FA] hover:bg-[#60A5FA]/90 disabled:bg-[#60A5FA]/60 text-[#111827] font-black text-xs tracking-wider uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 mt-6"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#111827]/30 border-t-[#111827] rounded-full animate-spin"></span>
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <span>Authorize Access</span>
            )}
          </button>

        </form>

        {/* Footer note */}
        <div className="mt-8 text-center border-t border-[#374151]/50 pt-4 flex items-center justify-center gap-1.5">
          <Radio size={12} className="text-[#4ADE80] animate-pulse" />
          <span className="text-[9px] font-mono text-[#9CA3AF]">SECURE LOCAL SESSION ACTIVE</span>
        </div>

      </div>
    </div>
  );
}
