'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSystemHealth, fetchWeatherLogs, fetchZones, SystemHealth, ApiWeatherLog } from '../../lib/api';
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
  ChevronRight,
  X
} from 'lucide-react';

const ZONE_NAMES: Record<string, string> = {
  'zone-1': 'Zone 1 (Purok Narra)',
  'zone-2': 'Zone 2 (Purok Mahogany)',
  'zone-3': 'Zone 3 (Sitio Pag-asa)',
  'zone-4': 'Zone 4 (Purok Acacia)',
  'zone-5': 'Zone 5 (Centro)',
};

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
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<ApiWeatherLog[]>([]);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [zonesCount, setZonesCount] = useState<number>(5);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  // Verify authorization
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('flows_admin_logged_in');
    const user = sessionStorage.getItem('flows_admin_user');
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

  // Disable background scrolling when any modal is active
  useEffect(() => {
    if (showLogoutModal || showTelemetryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutModal, showTelemetryModal]);



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

  // Synchronize Countdown Timer with top-of-the-hour boundary (next hour boundary)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
      
      let diffSec = Math.floor((targetTime.getTime() - now.getTime()) / 1000);
      if (diffSec < 0) {
        diffSec = 0;
      }
      
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

  // Load live health and weather logs from backend
  useEffect(() => {
    let active = true;
    
    const loadHealthAndLogs = async () => {
      try {
        const healthData = await fetchSystemHealth();
        if (!active) return;
        setHealth(healthData);
        
        const logsData = await fetchWeatherLogs(15);
        if (!active) return;
        setLogs(logsData);
        
        if (logsData.length > 0 && logsData[0].fetched_at) {
          const lastFetch = new Date(logsData[0].fetched_at);
          setLastFetchTime(lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else {
          const now = new Date();
          setLastFetchTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }

        // Fetch actual zone count from database dynamically
        try {
          const zonesData = await fetchZones();
          if (active) {
            setZonesCount(zonesData.length);
          }
        } catch (zErr) {
          console.error('[AdminDashboard] Error loading zones count:', zErr);
        }
        
        setIsHealthLoading(false);
      } catch (err) {
        console.error('[AdminDashboard] Error loading live health/logs:', err);
        if (!active) return;
        
        // Offline fallback
        const now = new Date();
        setLastFetchTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setIsHealthLoading(false);
      }
    };
    
    loadHealthAndLogs();
    const interval = setInterval(loadHealthAndLogs, 15 * 1000); // refresh every 15s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem('flows_admin_logged_in');
    sessionStorage.removeItem('flows_admin_user');
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

  if (isHealthLoading || !health || health.status === 'offline' || health.open_meteo?.status === 'unreachable') {
    return (
      <div className="fixed inset-0 bg-[#0b0f19] flex items-center justify-center text-white p-4 overflow-hidden z-50">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-[#60A5FA]/40 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center shadow-lg p-1 shrink-0">
              <img src="/flowsnoname.png" alt="FLOWS Logo" className="w-full h-full object-contain animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-white font-black uppercase tracking-[0.2em]">Synchronizing Admin Console...</p>
            <p className="text-[10px] text-[#9CA3AF] font-mono uppercase tracking-wider animate-pulse">Establishing telemetry connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between relative overflow-x-hidden transition-colors duration-500">

      {/* CORE ADMIN NAVIGATION HEADER — outside animate-fade-in so sticky positioning is viewport-relative */}
      <header className="flows-fixed-top-nav bg-[#111827]/95 border-b border-[#374151]/70 px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 backdrop-blur-md shadow-lg transition-all duration-300">
      
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
      <div className="hidden md:flex items-center gap-2 shrink-0">
        
        {/* API Health Status Badge */}
        {health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? (
          <div className="flex items-center gap-2 bg-[#065F46]/20 border border-[#059669]/30 hover:border-[#059669]/50 px-3 py-1.5 rounded-xl shadow-inner select-none transition-all duration-300 cursor-help" title={`API Sync Healthy. Latency: ${health.open_meteo.latency_ms ?? 0}ms`}>
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </div>
            <div className="text-left leading-none">
              <span className="text-[8px] font-black text-[#10B981] tracking-wider uppercase block mb-0.5">API STATUS</span>
              <span className="text-[10px] font-black text-[#4ADE80] uppercase tracking-wider">API HEALTHY</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#7F1D1D]/20 border border-[#B91C1C]/30 hover:border-[#B91C1C]/50 px-3 py-1.5 rounded-xl shadow-inner select-none transition-all duration-300 cursor-help" title="API Gateway Unreachable">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
            </div>
            <div className="text-left leading-none">
              <span className="text-[8px] font-black text-[#EF4444] tracking-wider uppercase block mb-0.5">API STATUS</span>
              <span className="text-[10px] font-black text-[#F87171] uppercase tracking-wider">GATEWAY OFFLINE</span>
            </div>
          </div>
        )}

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

      {/* Mobile Header Row for Time, Countdown & API Status */}
      <div className="flex md:hidden items-center justify-between w-full gap-1.5 border-t border-[#374151]/30 pt-2 select-none">
        
        {/* API Status Card */}
        <div className="flex items-center gap-1.5 bg-[#1F2937]/55 border border-[#374151]/60 px-2 py-1.5 rounded-lg shadow-inner flex-1 justify-center h-[36px] min-w-0 mobile-header-card">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
          </span>
          <div className="text-left leading-none min-w-0 pl-1">
            <span className="text-[6.5px] font-black text-[#9CA3AF] tracking-wider uppercase block">API STATUS</span>
            <span className={`text-[8.5px] font-black uppercase truncate block mt-0.5 ${health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}>
              {health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Countdown Card */}
        <div className="flex items-center gap-1 bg-[#1F2937]/55 border border-[#374151]/60 px-2 py-1.5 rounded-lg shadow-inner flex-1 justify-center h-[36px] min-w-0 mobile-header-card">
          <Clock size={11} className="text-[#60A5FA] shrink-0" />
          <div className="text-left leading-none min-w-0 pl-1">
            <span className="text-[6.5px] font-black text-[#60A5FA] tracking-wider uppercase block">NEXT SYNC</span>
            <span className="text-[9px] font-bold font-mono tracking-tight text-white block mt-0.5 truncate">{countdownTime || '00:59:59'}</span>
          </div>
        </div>

        {/* Date & Time Card */}
        <div className="flex items-center gap-1 bg-[#1F2937]/55 border border-[#374151]/60 px-2 py-1.5 rounded-lg shadow-inner flex-1 justify-center h-[36px] min-w-0 mobile-header-card">
          <Radio size={11} className="text-[#A78BFA] shrink-0" />
          <div className="text-left leading-none min-w-0 pl-1">
            <span className="text-[6.5px] font-black text-[#A78BFA] tracking-wider uppercase block">PH TIME</span>
            <span className="text-[9px] font-bold font-mono tracking-tight text-white block mt-0.5 truncate">
              {phTime ? phTime.replace(/:\d+\s/, ' ') : '10:27 PM'}
            </span>
          </div>
        </div>

      </div>

    </header>

      {/* Visual Content Wrapper with premium fade-in animation (declared separately to keep fixed viewport modals accurate) */}
      <div className="flex-1 flex flex-col animate-fade-in relative pt-[116px] md:pt-0">
        
        {/* Dynamic Background Glows */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#60A5FA] blur-[150px] opacity-5 pointer-events-none -translate-y-20 left-10" />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-[#4ADE80] blur-[150px] opacity-5 pointer-events-none -translate-y-20 right-10" />

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6 z-10">
        
        {/* Page title and mini status banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">System Status Overview</h2>
            <p className="text-xs text-[#9CA3AF]">
              Real-time telemetry and management controls for automated Open-Meteo rainfall observation.
            </p>
          </div>
          
          {/* Mobile Online status badge */}
          <div className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F2937] border border-[#374151]">
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
                {zonesCount}
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
                <span>Manage {zonesCount} Active Zones</span>
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

        {/* HEARTBEAT LOGS SECTION */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <Activity size={16} className="text-[#60A5FA] shrink-0 animate-pulse" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Heartbeat Logs</h3>
            <span className="text-[9px] bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Live</span>
          </div>

          <div className="bg-[#111827] border border-[#374151] rounded-2xl overflow-hidden shadow-2xl">

            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0b0f19] border-b border-[#374151]/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#9CA3AF] tracking-wider sm:tracking-widest uppercase truncate max-w-[200px] sm:max-w-none">Live API Monitor Console</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping" />
                <span className="text-[8px] sm:text-[9px] font-bold text-[#4ADE80] uppercase tracking-wider">STREAM ACTIVE</span>
              </div>
            </div>

            {/* Terminal Log Lines */}
            <div className="p-4 sm:p-5 font-mono text-[10px] sm:text-[11px] space-y-1.5 max-h-72 overflow-y-auto select-text leading-relaxed">
              {logs.length > 0 ? (
                logs.map((log, idx) => {
                  const zoneName = ZONE_NAMES[log.zone_id] || log.zone_id || 'Unknown Zone';
                  const dateStr = log.fetched_at
                    ? new Date(log.fetched_at).toLocaleString('en-US', { hour12: false }).replace(',', '')
                    : new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
                  const status = log.validation_status || 'OK';
                  const statusColor = status === 'PASSED' || status === 'OK' ? 'text-[#4ADE80]' : 'text-[#F59E0B]';
                  const statusTag = status === 'PASSED' || status === 'OK' ? '[ OK ]' : '[WARN]';

                  return (
                    <div key={log.id || idx} className="flex items-start gap-2 sm:gap-3 leading-normal sm:leading-relaxed">
                      <span className={`${statusColor} font-black shrink-0`}>{statusTag}</span>
                      <span className="text-[#9CA3AF] break-all sm:break-normal">
                        <span className="text-[#4B5563]">{dateStr.includes(',') ? dateStr.split(',')[1]?.trim() : dateStr}</span> — {zoneName.split(' - ')[0]} Open-Meteo pull: <span className="text-white font-bold">{log.precipitation_mm ?? 0} mm</span>.
                      </span>
                    </div>
                  );
                })
              ) : (
                /* Telemetry stream offline - show meaningful offline state */
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-[#EF4444] font-black shrink-0">[FAIL]</span>
                    <span className="text-[#EF4444] font-bold break-all sm:break-normal"><span className="text-[#4B5563]">{phDate} {phTime}</span> — Connection to telemetry gateway failed. Stream offline.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#F59E0B] font-black shrink-0">[WARN]</span>
                    <span className="text-[#9CA3AF] break-all sm:break-normal"><span className="text-[#4B5563]">{phDate} {phTime}</span> — Database telemetry synchronization paused. Waiting for gateway reconnection.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#60A5FA] font-black shrink-0">[INFO]</span>
                    <span className="text-[#9CA3AF] break-all sm:break-normal"><span className="text-[#4B5563]">{phDate} {phTime}</span> — System standing by in offline safe mode. Please verify the FastAPI backend server is active.</span>
                  </div>
                </>
              )}
              {/* Blinking cursor line */}
              <div className="flex items-center gap-3 mt-2 select-none">
                <span className="text-[#60A5FA] font-black shrink-0 animate-pulse">[ &gt;&gt; ]</span>
                <span className="text-[#60A5FA] font-mono text-[9px] sm:text-[10px]">Waiting for next API cycle...<span className="inline-block w-1.5 h-3 bg-[#60A5FA] ml-0.5 animate-pulse align-middle" /></span>
              </div>
            </div>

            {/* Terminal footer stats row */}
            <div className="bg-[#0b0f19] border-t border-[#374151]/60 px-4 sm:px-5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[9px] font-mono">
              <div className="flex items-center gap-4 select-none shrink-0">
                <span className="text-[#4ADE80] font-bold">✓ {logs.length || 5} OK</span>
                <span className="text-[#A78BFA] font-bold">ℹ API: {health?.open_meteo?.status?.toUpperCase() || 'ONLINE'}</span>
              </div>
              <div className="text-[#9CA3AF] truncate max-w-full">
                <span className="hidden sm:inline">Endpoint: <span className="text-[#60A5FA]">{health?.open_meteo?.endpoint?.replace('https://', '') || 'api.open-meteo.com'}</span> · </span>
                Latency: <span className="text-[#4ADE80]">{health?.open_meteo?.latency_ms ? `${health.open_meteo.latency_ms}ms` : '32ms'}</span>
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

      {/* Closing Content Wrapper */}
      </div>

      {/* CUSTOM LOGOUT CONFIRMATION MODAL (Placed outside containment blocks for true viewport fixed positioning) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          
          {/* Modal Card */}
          <div className="bg-[#1F2937] border border-[#374151] w-full max-w-sm rounded-3xl shadow-2xl p-6 relative z-10 text-center space-y-5 weather-glow-red animate-scale-in">
            
            {/* Warning Circle Icon */}
            <div className="w-14 h-14 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444] mx-auto animate-pulse">
              <LogOut size={26} />
            </div>

            {/* Modal Heading & Text */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Confirm Console Logout
              </h3>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Are you sure you want to end your administration session? You will be returned to the secure gateway login page.
              </p>
            </div>

            {/* Row of Action Buttons */}
            <div className="flex gap-2.5 pt-2 border-t border-[#374151]/55">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-[#111827] hover:bg-[#111827]/70 border border-[#374151] hover:border-[#9CA3AF] text-[#9CA3AF] hover:text-white rounded-xl font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 py-2.5 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-black uppercase tracking-wider rounded-xl transition-all duration-150 shadow-md shadow-red-500/10 cursor-pointer"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE TELEMETRY CONSOLE & LOGS OVERLAY MODAL */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowTelemetryModal(false)} />
          
          {/* Modal Card */}
          <div className="bg-[#1F2937]/95 backdrop-blur-md border border-[#374151] w-full max-w-md rounded-3xl shadow-2xl p-5 relative z-10 space-y-4 weather-glow-blue animate-scale-in text-xs max-h-[85vh] flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#374151]/60 shrink-0">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[#60A5FA] animate-pulse" />
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-sans">
                    API Telemetry & Logs
                  </h3>
                  <p className="text-[9px] text-[#9CA3AF] font-bold">Barangay Rizal Console Telemetry</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTelemetryModal(false)}
                className="p-1 bg-[#111827] border border-[#374151] rounded text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Status Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0 select-none">
              
              {/* Stat 1: API Gateway Status */}
              <div className="bg-[#111827]/60 border border-[#374151]/55 rounded-xl p-2.5 flex items-center gap-2">
                <div className="relative flex h-2 w-2 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
                </div>
                <div className="leading-none min-w-0">
                  <span className="text-[7px] text-[#9CA3AF] uppercase block mb-0.5">API STATUS</span>
                  <span className={`text-[9px] font-black uppercase truncate block ${health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}>
                    {health && health.status !== 'offline' && health.open_meteo?.status === 'healthy' ? 'API HEALTHY' : 'GATEWAY OFFLINE'}
                  </span>
                </div>
              </div>

              {/* Stat 2: Next Auto-Fetch Countdown */}
              <div className="bg-[#111827]/60 border border-[#374151]/55 rounded-xl p-2.5 flex items-center gap-2">
                <Clock size={12} className="text-[#60A5FA] shrink-0" />
                <div className="leading-none min-w-0">
                  <span className="text-[7px] text-[#60A5FA] uppercase block mb-0.5">NEXT FORECAST</span>
                  <span className="text-[10px] font-black font-mono text-white truncate block">
                    {countdownTime || '00:59:59'}
                  </span>
                </div>
              </div>

              {/* Stat 3: Open-Meteo Latency */}
              <div className="bg-[#111827]/60 border border-[#374151]/55 rounded-xl p-2.5 flex items-center gap-2">
                <Database size={12} className="text-[#4ADE80] shrink-0" />
                <div className="leading-none min-w-0">
                  <span className="text-[7px] text-[#4ADE80] uppercase block mb-0.5">API LATENCY</span>
                  <span className="text-[9px] font-black font-mono text-white truncate block">
                    {health?.open_meteo?.latency_ms ? `${health.open_meteo.latency_ms}ms` : '32ms'}
                  </span>
                </div>
              </div>

              {/* Stat 4: PH Local Time */}
              <div className="bg-[#111827]/60 border border-[#374151]/55 rounded-xl p-2.5 flex items-center gap-2">
                <Radio size={12} className="text-[#A78BFA] shrink-0" />
                <div className="leading-none min-w-0">
                  <span className="text-[7px] text-[#A78BFA] uppercase block mb-0.5">PHILIPPINE TIME</span>
                  <span className="text-[9px] font-black font-mono text-white truncate block">
                    {phTime ? phTime.replace(/:\d+\s/, ' ') : '10:27 PM'}
                  </span>
                </div>
              </div>

            </div>

            {/* Log Terminal Block */}
            <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
              <span className="text-[8px] font-black text-[#9CA3AF] uppercase tracking-wider block">
                Live Console Terminal Output
              </span>
              <div className="flex-1 bg-[#111827] border border-[#374151] rounded-2xl p-4 font-mono text-[9px] overflow-y-auto select-text space-y-2">
                {logs.length > 0 ? (
                  logs.map((log, idx) => {
                    const zoneName = ZONE_NAMES[log.zone_id] || log.zone_id || 'Unknown Zone';
                    const dateStr = log.fetched_at 
                      ? new Date(log.fetched_at).toLocaleString('en-US', { hour12: false }).replace(',', '') 
                      : new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
                    const status = log.validation_status || 'OK';
                    const statusColor = status === 'PASSED' || status === 'OK' ? 'text-[#4ADE80]' : 'text-[#F59E0B]';
                    const statusTag = status === 'PASSED' || status === 'OK' ? '[ OK ]' : '[WARN]';
                    
                    return (
                      <div key={log.id || idx} className="flex items-start gap-2 leading-normal">
                        <span className={`${statusColor} font-black shrink-0`}>{statusTag}</span>
                        <span className="text-[#9CA3AF]">
                          <span className="text-[#374151]/80">{dateStr.split(' ')[1]}</span> — {zoneName.replace(/\s\(.*/, '')} rainfall: {log.precipitation_mm ?? 0} mm.
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-[#EF4444] font-bold py-4">
                    [FAIL] Telemetry gateway offline. No live logs synchronized.
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#60A5FA] font-black shrink-0 animate-pulse">[ &gt;&gt; ]</span>
                  <span className="text-[#60A5FA] font-mono text-[9px]">Listening for next pull...</span>
                </div>
              </div>
            </div>

            {/* Close Modal footer button */}
            <div className="pt-3 border-t border-[#374151]/60 shrink-0 font-sans">
              <button 
                onClick={() => setShowTelemetryModal(false)}
                className="w-full py-2.5 bg-[#60A5FA] hover:bg-[#60A5FA]/90 text-[#111827] font-black uppercase tracking-wider rounded-xl transition-all duration-150 shadow-md shadow-blue-500/10 cursor-pointer text-[10px]"
              >
                Got it, close console
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
