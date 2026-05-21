'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  LogOut, 
  MapPin, 
  History, 
  Home, 
  Radio, 
  Activity, 
  CloudRain, 
  Clock, 
  Database,
  ArrowRight,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState('');
  const [currentUser, setCurrentUser] = useState('admin');

  // Verify authorization
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('flows_admin_logged_in');
    const user = localStorage.getItem('flows_admin_user');
    if (isLoggedIn !== 'true') {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
      if (user) setCurrentUser(user);
    }
  }, [router]);

  // Set simulated sync time
  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    setLastFetchTime(formatTime());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('flows_admin_logged_in');
    localStorage.removeItem('flows_admin_user');
    router.push('/admin/login');
  };

  if (!authorized) {
    return (
      <div className="bg-[#0b0f19] min-h-screen w-full flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-wider">Verifying Session Security...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between animate-fade-in">
      
      {/* Dynamic Background Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#60A5FA] blur-[150px] opacity-5 pointer-events-none -translate-y-20 left-10" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#4ADE80] blur-[150px] opacity-5 pointer-events-none -translate-y-20 right-10" />

      {/* CORE ADMIN NAVIGATION HEADER */}
      <header className="bg-[#111827] border-b border-[#374151] sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-xl text-[#60A5FA]">
            <ShieldAlert size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-1.5">
              F.L.O.W.S. CONTROL
              <span className="text-[9px] bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Console</span>
            </h1>
            <p className="text-[10px] text-[#9CA3AF] font-semibold">Barangay Rizal Rainfall System</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* System Online Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F2937] border border-[#374151]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]"></span>
            </span>
            <span className="text-[10px] font-bold text-[#4ADE80] tracking-wider uppercase">Telemetry Established</span>
          </div>

          {/* User profile dropdown indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#9CA3AF] bg-[#1F2937]/50 border border-[#374151]/50 py-1.5 px-3 rounded-lg">
            <User size={12} className="text-[#60A5FA]" />
            <span className="capitalize">{currentUser}</span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 hover:border-[#EF4444]/50 py-1.5 px-3 rounded-lg text-xs font-extrabold text-[#EF4444] transition-all duration-150"
          >
            <LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6 z-10">
        
        {/* Page title and mini status banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">System Status Overview</h2>
            <p className="text-xs text-[#9CA3AF]">
              Real-time telemetry and management controls for automated Doppler rainfall observation.
            </p>
          </div>
          
          {/* Mobile Online status badge */}
          <div className="flex sm:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F2937] border border-[#374151]">
            <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-ping" />
            <span className="text-[9px] font-bold text-[#4ADE80] tracking-wider uppercase">Telemetry Established</span>
          </div>
        </div>

        {/* SUMMARY CARDS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Active Zones Count */}
          <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 hover:border-[#60A5FA]/30 transition-all duration-150 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider block">ACTIVE SENSORS / ZONES</span>
              <h3 className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5">
                5
                <span className="text-xs font-bold text-[#4ADE80] bg-[#4ADE80]/10 px-1.5 py-0.5 rounded">Operational</span>
              </h3>
              <p className="text-[10px] text-[#9CA3AF] leading-tight">Barangay Rizal territories reporting rain metrics</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#60A5FA]/10 border border-[#60A5FA]/20 flex items-center justify-center text-[#60A5FA]">
              <MapPin size={24} />
            </div>
          </div>

          {/* Card 2: Last Fetch Time */}
          <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 hover:border-[#F59E0B]/30 transition-all duration-150 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider block">LAST TELEMETRY SYNC</span>
              <h3 className="text-3xl font-black text-white font-mono truncate max-w-[200px]">
                {lastFetchTime}
              </h3>
              <p className="text-[10px] text-[#4ADE80] font-bold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#4ADE80] animate-ping" />
                Auto-syncing every 60 seconds
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
              <Clock size={24} />
            </div>
          </div>

          {/* Card 3: Records Logged Today */}
          <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 hover:border-[#A78BFA]/30 transition-all duration-150 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider block">LOGS GENERATED TODAY</span>
              <h3 className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5">
                120
                <span className="text-xs font-bold text-[#A78BFA] bg-[#A78BFA]/10 px-1.5 py-0.5 rounded">Telemetry</span>
              </h3>
              <p className="text-[10px] text-[#9CA3AF] leading-tight">Daily sensor reports logged to history base</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center text-[#A78BFA]">
              <Database size={24} />
            </div>
          </div>

        </div>

        {/* QUICK NAVIGATION CARDS */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
            System Administration Tools
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Nav Card 1: Zone Management */}
            <Link 
              href="/admin/zones"
              className="bg-[#1F2937] border border-[#374151] hover:border-[#60A5FA]/40 hover:bg-[#253245] rounded-2xl p-6 transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="p-3 bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-2xl text-[#60A5FA] inline-flex mb-4">
                  <MapPin size={24} />
                </div>
                <h4 className="text-base font-black text-white group-hover:text-[#60A5FA] transition-colors">
                  Zone Parameter Control
                </h4>
                <p className="text-xs text-[#9CA3AF] leading-relaxed mt-1.5">
                  Configure monitored sectors, define custom risk bounds, add new sensor nodes, and manage territory parameters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#374151]/50 flex items-center justify-between text-xs text-[#60A5FA] font-bold">
                <span>Manage 5 Active Zones</span>
                <ChevronRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Nav Card 2: Rainfall History */}
            <Link 
              href="/admin/history"
              className="bg-[#1F2937] border border-[#374151] hover:border-[#4ADE80]/40 hover:bg-[#253245] rounded-2xl p-6 transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="p-3 bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-2xl text-[#4ADE80] inline-flex mb-4">
                  <History size={24} />
                </div>
                <h4 className="text-base font-black text-white group-hover:text-[#4ADE80] transition-colors">
                  Rainfall Logs History
                </h4>
                <p className="text-xs text-[#9CA3AF] leading-relaxed mt-1.5">
                  Review absolute system database charts, validate anomalous rain sensor spikes, and sort through chronological records.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#374151]/50 flex items-center justify-between text-xs text-[#4ADE80] font-bold">
                <span>Browse Telemetry Logs</span>
                <ChevronRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Nav Card 3: Resident Dashboard (Public) */}
            <Link 
              href="/"
              className="bg-[#1F2937] border border-[#374151] hover:border-[#A78BFA]/40 hover:bg-[#253245] rounded-2xl p-6 transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="p-3 bg-[#A78BFA]/10 border border-[#A78BFA]/20 rounded-2xl text-[#A78BFA] inline-flex mb-4">
                  <Home size={24} />
                </div>
                <h4 className="text-base font-black text-white group-hover:text-[#A78BFA] transition-colors">
                  Public Resident App
                </h4>
                <p className="text-xs text-[#9CA3AF] leading-relaxed mt-1.5">
                  Open the public resident view app containing bento observatory grids, quick-selector territories, and flood warnings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#374151]/50 flex items-center justify-between text-xs text-[#A78BFA] font-bold">
                <span>View Resident UI</span>
                <ExternalLink size={14} className="transform group-hover:scale-110 transition-transform" />
              </div>
            </Link>

          </div>
        </div>

        {/* INFORMATIONAL BLOCK */}
        <div className="bg-[#1F2937]/40 border border-[#374151] rounded-2xl p-5 flex items-start gap-4 text-xs leading-relaxed text-[#9CA3AF]">
          <Activity size={20} className="text-[#60A5FA] shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="font-extrabold text-white">Observer Security Standard Warning</span>
            <p>
              All active modifications to zone profiles, threshold calibrations, and validated history records require administrative credentials. Any changes recorded will be automatically cataloged in the local storage telemetry ledger for auditing purposes.
            </p>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#111827] border-t border-[#374151] py-4 text-center mt-12">
        <p className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">
          © 2026 F.L.O.W.S. ADMIN PORTAL • BARANGAY RIZAL LOCAL RESCUE TELEMETRY BRANCH
        </p>
      </footer>

    </div>
  );
}
