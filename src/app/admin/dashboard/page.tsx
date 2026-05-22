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
  
  // Theme state locked to dark
  const [theme] = useState<'dark'>('dark');
  const [phTime, setPhTime] = useState<string>('');
  const [phDate, setPhDate] = useState<string>('');
  const [countdownTime, setCountdownTime] = useState<string>('');

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

  // Enforce dark mode globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);



  // Synchronize Live Time
  useEffect(() => {
    const updatePhTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      };
      
      setPhDate(now.toLocaleDateString('en-US', dateOptions));
      setPhTime(now.toLocaleTimeString('en-US', timeOptions));
    };

    updatePhTime();
    const interval = setInterval(updatePhTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize Countdown Timer (resets every hour boundary starting from exactly 1 hour)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
      const diffSec = Math.floor((nextHour.getTime() - now.getTime()) / 1000);
      
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setCountdownTime(formatted);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div data-theme={theme} className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between relative overflow-x-hidden transition-colors duration-500 animate-fade-in">
      
      {/* Dynamic Background Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#60A5FA] blur-[150px] opacity-5 pointer-events-none -translate-y-20 left-10" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#4ADE80] blur-[150px] opacity-5 pointer-events-none -translate-y-20 right-10" />

      {/* CORE ADMIN NAVIGATION HEADER */}
      <header className="bg-[#111827]/95 border-b border-[#374151]/70 sticky top-0 z-30 px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 backdrop-blur-md shadow-lg transition-all duration-300">
        
        {/* Branding Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1F2937] border border-[#374151] overflow-hidden flex items-center justify-center shrink-0 p-1">
              <img src="/flowsnoname.png" alt="FLOWS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                F.L.O.W.S. CONTROL
                <span className="text-[9px] bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Console</span>
              </h1>
              <p className="text-[8px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">Barangay Rizal Rainfall System</p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button 
              onClick={handleLogout}
              className="p-1.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/20 flex items-center justify-center cursor-pointer"
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>

        {/* Live Right-side controls (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          
          {/* Countdown Card (API Next Forecast) */}
          <div className="flex items-center gap-2 bg-[#1F2937]/55 border border-[#374151]/60 px-3 py-1.5 rounded-xl shadow-inner select-none shrink-0">
            <Clock size={14} className="text-[#60A5FA] animate-pulse" />
            <div className="text-left leading-none">
              <span className="text-[8px] font-black text-[#60A5FA] tracking-wider uppercase block mb-0.5">API NEXT FORECAST</span>
              <span className="text-xs font-black font-mono tracking-tight text-white">{countdownTime || '00:59:59'}</span>
            </div>
          </div>

          {/* Date & Time Card with Aligned Philippine Flag */}
          <div className="flex items-center gap-2.5 bg-[#1F2937]/55 border border-[#374151]/60 px-3 py-1.5 rounded-xl shadow-inner select-none shrink-0 justify-center">
            <div className="text-left leading-none space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black font-mono tracking-tight text-white">{phTime || '10:27:00 PM'}</span>
                <span className="text-[8px] font-black text-[#60A5FA] tracking-wider uppercase bg-[#60A5FA]/10 px-1.5 py-0.5 rounded flex items-center gap-1 select-none">
                  PH <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 9" className="w-4 h-2 shadow-sm rounded-[1px] inline-block align-middle select-none">
                    <rect width="18" height="9" fill="#FCD116" />
                    <rect width="18" height="4.5" fill="#0038A8" />
                    <rect y="4.5" width="18" height="4.5" fill="#CE1126" />
                    <polygon points="0,0 0,9 7.79,4.5" fill="#FFFFFF" />
                    <circle cx="2.5" cy="4.5" r="0.9" fill="#FCD116" />
                  </svg>
                </span>
              </div>
              <div className="text-[9px] text-[#9CA3AF] font-bold tracking-wide">{phDate || 'Thursday, May 21, 2026'}</div>
            </div>
          </div>

          {/* User profile indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#9CA3AF] bg-[#1F2937]/50 border border-[#374151]/50 py-1.5 px-3 rounded-xl select-none">
            <User size={12} className="text-[#60A5FA]" />
            <span className="capitalize text-white">{currentUser}</span>
          </div>

          {/* Logout Button positioned at the very right */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 hover:border-[#EF4444]/50 rounded-xl text-xs font-black text-[#EF4444] transition-all shadow-md group shrink-0 cursor-pointer"
            title="Logout and Close Console Session"
          >
            <span>Logout</span>
            <LogOut size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>

        {/* Mobile Header Row for Time & Countdown */}
        <div className="flex sm:hidden items-center justify-between w-full gap-2 border-t border-[#374151]/30 pt-2 select-none">
          {/* Countdown Card */}
          <div className="flex items-center gap-1.5 bg-[#1F2937]/55 border border-[#374151]/60 px-2.5 py-1 rounded-lg shadow-inner flex-1 justify-center">
            <Clock size={11} className="text-[#60A5FA]" />
            <div className="text-left leading-none">
              <span className="text-[7px] font-black text-[#60A5FA] tracking-wider uppercase block">NEXT FORECAST</span>
              <span className="text-[10px] font-bold font-mono tracking-tight text-white">{countdownTime || '00:59:59'}</span>
            </div>
          </div>
          {/* Date & Time Card */}
          <div className="flex items-center gap-1.5 bg-[#1F2937]/55 border border-[#374151]/60 px-2.5 py-1 rounded-lg shadow-inner flex-1 justify-center">
            <div className="text-center leading-none">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-bold font-mono tracking-tight text-white">{phTime ? phTime.replace(/:\d+\s/, ' ') : '10:27 PM'}</span>
                <span className="text-[7px] font-black text-[#60A5FA] tracking-wider uppercase bg-[#60A5FA]/10 px-1 rounded flex items-center gap-0.5">
                  PH <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 9" className="w-3.5 h-1.5 shadow-sm rounded-[1px] inline-block align-middle select-none">
                    <rect width="18" height="9" fill="#FCD116" />
                    <rect width="18" height="4.5" fill="#0038A8" />
                    <rect y="4.5" width="18" height="4.5" fill="#CE1126" />
                    <polygon points="0,0 0,9 7.79,4.5" fill="#FFFFFF" />
                    <circle cx="2.5" cy="4.5" r="0.9" fill="#FCD116" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
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

        {/* DOPPLER API HEARTBEAT / HEALTH LOGS TERMINAL */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
            Doppler API Heartbeat &amp; Health Logs
          </h3>

          <div className="bg-[#111827] border border-[#374151] rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#0b0f19] border-b border-[#374151]/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#9CA3AF] tracking-widest uppercase">FLOWS-DOPPLER-STREAM v2.4.1 — Live API Monitor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping" />
                <span className="text-[9px] font-bold text-[#4ADE80] uppercase tracking-wider">STREAM ACTIVE</span>
              </div>
            </div>

            {/* Terminal Log Lines */}
            <div className="p-5 font-mono text-[11px] space-y-1.5 max-h-72 overflow-y-auto select-text">
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:01</span> — Doppler radar sync established on port :8443. Handshake successful.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:03</span> — Zone 1 (Purok Narra) telemetry pull: 32.8 mm/hr. Record committed.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:04</span> — Zone 2 (Purok Mahogany) telemetry pull: 12.4 mm/hr. Record committed.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#F59E0B] font-black shrink-0">[WARN]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:05</span> — Zone 2: Rain rate anomaly spike detected (45.2 mm/hr). Flagging for review.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:06</span> — Zone 3 (Sitio Pag-asa) telemetry pull: 22.1 mm/hr. Record committed.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:07</span> — Zone 4 (Purok Acacia) telemetry pull: 8.5 mm/hr. Record committed.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:08</span> — Zone 5 (Centro) telemetry pull: 3.2 mm/hr. Record committed.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#EF4444] font-black shrink-0">[ ERR]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:09</span> — Doppler echo timeout on Zone 1 secondary sensor (node-1B). Retrying in 5s...</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:14</span> — Zone 1 secondary sensor (node-1B) reconnected. Telemetry restored.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:58:15</span> — Full sector sweep complete. 5 of 5 zones reporting. API health: OPTIMAL.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 00:59:01</span> — Scheduled 60-second heartbeat ping to PAGASA relay endpoint. Response: 200 OK.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#A78BFA] font-black shrink-0">[INFO]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 01:00:00</span> — Hourly forecast batch dispatched to resident observation frontend. Zones synced: 5.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4ADE80] font-black shrink-0">[ OK ]</span>
                <span className="text-[#9CA3AF]"><span className="text-[#374151]">2026-05-22 01:00:02</span> — All telemetry streams nominal. Next full sweep in 60 seconds.</span>
              </div>
              {/* Blinking cursor line */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[#60A5FA] font-black shrink-0 animate-pulse">[ &gt;&gt; ]</span>
                <span className="text-[#60A5FA] font-mono text-[11px]">Waiting for next API cycle...<span className="inline-block w-1.5 h-3 bg-[#60A5FA] ml-0.5 animate-pulse align-middle" /></span>
              </div>
            </div>

            {/* Terminal footer stats row */}
            <div className="bg-[#0b0f19] border-t border-[#374151]/60 px-5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[9px] font-mono">
              <div className="flex items-center gap-4">
                <span className="text-[#4ADE80] font-bold">✓ 11 OK</span>
                <span className="text-[#F59E0B] font-bold">⚠ 1 WARN</span>
                <span className="text-[#EF4444] font-bold">✗ 1 ERR (Resolved)</span>
                <span className="text-[#A78BFA] font-bold">ℹ 1 INFO</span>
              </div>
              <div className="text-[#9CA3AF]">
                API Endpoint: <span className="text-[#60A5FA]">doppler.flows.pagasa.relay:8443</span> · Latency: <span className="text-[#4ADE80]">38ms</span>
              </div>
            </div>

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
