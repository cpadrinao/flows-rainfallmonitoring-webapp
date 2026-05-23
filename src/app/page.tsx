'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeatherSummary, ZoneData } from './lib/api';
import Link from 'next/link';
import { 
  CloudRain, 
  CloudLightning, 
  CloudDrizzle,
  Cloud,
  Sun,
  Droplets, 
  Timer, 
  Activity, 
  ChevronDown, 
  AlertTriangle, 
  Bell, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Send, 
  Info,
  ExternalLink,
  Volume2,
  Lock,
  ArrowRight,
  Flame,
  Radio,
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  Home,
  RefreshCw
} from 'lucide-react';

// ZoneData interface is imported from ./lib/api

// Fallback mock data — shown while the API loads or if unreachable
const FALLBACK_ZONES: Record<string, ZoneData> = {
  'zone-1': {
    id: 'zone-1',
    name: 'Zone 1',
    purok: 'Purok Narra (Riverside Area)',
    status: 'Heavy Rain',
    alertLevel: 'Red',
    alertText: 'Critical Flood Risk (Evacuate Now)',
    advisoryText: 'River water level has exceeded the 4.5m critical threshold. Residents near the riverbank must proceed to the Barangay Rizal Multipurpose Gym immediately.',
    amount: 32.8,
    amountTrend: '+6.4 mm from last hour',
    duration: '2h 15m',
    humidity: 96,
    trend: [14, 18, 20, 24, 25, 28, 30, 32, 33, 31, 32, 33],
    riskLevel: 'Critical',
    evacuationRecommended: true,
  },
  'zone-2': {
    id: 'zone-2',
    name: 'Zone 2',
    purok: 'Purok Mahogany (Upper Ridge)',
    status: 'Moderate Rain',
    alertLevel: 'Green',
    alertText: 'Normal (Safe Level)',
    advisoryText: 'Moderate rainfall detected. Drainage is flowing normally. No flooding risks present. Continue monitoring local broadcasts for changes.',
    amount: 12.4,
    amountTrend: '-1.2 mm from last hour',
    duration: '1h 10m',
    humidity: 84,
    trend: [6, 8, 10, 11, 12, 13, 14, 13, 13, 12, 11, 12],
    riskLevel: 'Safe',
    evacuationRecommended: false,
  },
  'zone-3': {
    id: 'zone-3',
    name: 'Zone 3',
    purok: 'Sitio Pag-asa (Lowland Plain)',
    status: 'Heavy Rain',
    alertLevel: 'Orange',
    alertText: 'High Flood Risk (Prepare Evac)',
    advisoryText: 'Street-level flooding observed (6-10 inches) on Pag-asa Main Road. Small vehicles advised to avoid the route. Secure appliances and prepare emergency kits.',
    amount: 22.1,
    amountTrend: '+3.5 mm from last hour',
    duration: '1h 55m',
    humidity: 92,
    trend: [8, 12, 14, 16, 18, 19, 21, 22, 22, 21, 20, 22],
    riskLevel: 'Warning',
    evacuationRecommended: false,
  },
  'zone-4': {
    id: 'zone-4',
    name: 'Zone 4',
    purok: 'Purok Acacia (Slope & Foothills)',
    status: 'Light Rain',
    alertLevel: 'Yellow',
    alertText: 'Landslide Monitoring Active',
    advisoryText: 'Rainfall is minor but cumulative soil saturation is high. Residents near mountain slopes should keep watch for minor soil movements or rockfalls.',
    amount: 8.5,
    amountTrend: '+0.8 mm from last hour',
    duration: '45m',
    humidity: 88,
    trend: [3, 4, 5, 6, 7, 8, 8, 8, 7, 7, 8, 8],
    riskLevel: 'Monitor',
    evacuationRecommended: false,
  },
  'zone-5': {
    id: 'zone-5',
    name: 'Zone 5',
    purok: 'Purok Ilang-Ilang (Centro)',
    status: 'Cloudy',
    alertLevel: 'Green',
    alertText: 'Normal (Safe Level)',
    advisoryText: 'Overcast skies with light drizzle. Rainfall is minor. No flooding or landslide risk at present. Barangay center operations are active.',
    amount: 3.2,
    amountTrend: '-0.5 mm from last hour',
    duration: '25m',
    humidity: 79,
    trend: [1, 2, 3, 3, 4, 3, 3, 3, 2, 2, 1, 3],
    riskLevel: 'Safe',
    evacuationRecommended: false,
  }
};

// Stable zone key list for the dropdown — maps old slug keys to fallback data
const FALLBACK_ZONE_KEYS = ['zone-1', 'zone-2', 'zone-3', 'zone-4', 'zone-5'];

export default function FLOWSApp() {
  // Theme state locked to dark
  const [theme] = useState<'dark'>('dark');

  // Portal vs Dashboard view mode selector
  const [viewMode, setViewMode] = useState<'gateway' | 'dashboard'>('gateway');
  const [activeTab, setActiveTab] = useState<'weather' | 'zones' | 'alerts' | 'emergency'>('weather');
  const [selectedZone, setSelectedZone] = useState<string>('zone-1');

  // Live data state — starts with fallback, replaced by API data when available
  const [zonesData, setZonesData] = useState<Record<string, ZoneData>>(FALLBACK_ZONES);
  const [isLiveData, setIsLiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [liveZoneKeys, setLiveZoneKeys] = useState<string[]>(FALLBACK_ZONE_KEYS);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  // Active Shelter Center inside the emergency view
  const [activeCenter, setActiveCenter] = useState<string>('center-1');
  
  // Date & Time states in Philippine Time
  const [phTime, setPhTime] = useState<string>('');
  const [phDate, setPhDate] = useState<string>('');
  const [countdownTime, setCountdownTime] = useState<string>('');

  // Typing animation states for description
  const [displayedText, setDisplayedText] = useState<string>('');
  const [typingComplete, setTypingComplete] = useState<boolean>(false);

  useEffect(() => {
    const fullText = "F.L.O.W.S. is your direct source for real-time weather updates in Barangay Rizal. Our automated system tracks heavy rainfall across different local zones, giving you the clear, reliable information you need to stay safe and prepare early.";
    let index = 0;
    setDisplayedText('');
    setTypingComplete(false);
    
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTypingComplete(true);
      }
    }, 160); // Slower, highly-readable typing speed (160ms)
    
    return () => clearInterval(interval);
  }, []);

  // Handle URL query parameter synchronization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const tab = params.get('tab');
      if (view === 'dashboard') {
        setViewMode('dashboard');
      }
      if (tab === 'weather' || tab === 'zones' || tab === 'alerts' || tab === 'emergency') {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const changeTab = (tab: 'weather' | 'zones' | 'alerts' | 'emergency') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'dashboard');
      url.searchParams.set('tab', tab);
      window.history.pushState(null, '', url.pathname + url.search);
    }
  };

  const enterDashboard = () => {
    setViewMode('dashboard');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'dashboard');
      url.searchParams.set('tab', activeTab);
      window.history.pushState(null, '', url.pathname + url.search);
    }
  };

  const enterGateway = () => {
    setViewMode('gateway');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  // Enforce dark mode globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);

  // Fetch live data from FastAPI backend
  const loadLiveData = useCallback(async () => {
    const startTime = Date.now();
    setIsBackendOffline(false);
    try {
      const liveData = await fetchWeatherSummary();
      if (Object.keys(liveData).length > 0) {
        setZonesData(liveData);
        const keys = Object.keys(liveData);
        setLiveZoneKeys(keys);
        // Select first zone if current selectedZone is a slug (fallback) key
        setSelectedZone(prev => liveData[prev] ? prev : keys[0]);
        setIsLiveData(true);
        setIsBackendOffline(false);
      }
    } catch {
      // Silently keep fallback mock data — API may not be running yet
      console.warn('[F.L.O.W.S.] Backend unreachable, using fallback mock data.');
      setIsBackendOffline(true);
    } finally {
      // Ensure the premium loader stays visible for at least 800ms to prevent ugly UI flashes
      const elapsed = Date.now() - startTime;
      const minDelay = 800;
      const remaining = Math.max(0, minDelay - elapsed);
      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadLiveData();
    // Refresh every 5 minutes
    const interval = setInterval(loadLiveData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadLiveData]);



  // Synchronize Live Time
  useEffect(() => {
    const updatePhTime = () => {
      const now = new Date();
      // Format options to match Philippine Time
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

  // Synchronize Countdown Timer with hourly rainfall data retrieval schedule
  // Synchronize Countdown Timer with hourly rainfall data retrieval schedule (next hour boundary)
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

  const activeZoneData = zonesData[selectedZone] || Object.values(zonesData)[0] || FALLBACK_ZONES['zone-1'];

  // Helper: return background glow class based on warning level
  const getGlowClass = (level: 'Red' | 'Orange' | 'Yellow' | 'Green') => {
    switch (level) {
      case 'Red': return 'weather-glow-red border-red-500/40';
      case 'Orange': return 'weather-glow-orange border-orange-500/40';
      case 'Yellow': return 'weather-glow-yellow border-yellow-500/40';
      case 'Green': return 'weather-glow-green border-green-500/40';
      default: return 'border-[#374151]';
    }
  };

  // Helper: return alert color
  const getAlertColor = (level: 'Red' | 'Orange' | 'Yellow' | 'Green') => {
    switch (level) {
      case 'Red': return '#EF4444';
      case 'Orange': return '#F97316';
      case 'Yellow': return '#F59E0B';
      case 'Green': return '#4ADE80';
      default: return '#60A5FA';
    }
  };

  // Helper: get weather icon
  const getWeatherIcon = (status: string, size = 32) => {
    switch (status) {
      case 'Heavy Rain':
        return <CloudLightning size={size} className="text-[#EF4444] animate-pulse-slow" />;
      case 'Moderate Rain':
        return <CloudRain size={size} className="text-[#F97316] animate-wave-slow" />;
      case 'Light Rain':
        return <CloudDrizzle size={size} className="text-[#60A5FA] animate-wave-slow" />;
      case 'Cloudy':
        return <Cloud size={size} className="text-[#9CA3AF]" />;
      case 'Clear':
        return <Sun size={size} className="text-[#4ADE80] animate-spin" style={{ animationDuration: '20s' }} />;
      default:
        return <CloudRain size={size} className="text-[#60A5FA]" />;
    }
  };

  return (
    <div data-theme={theme} className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between relative overflow-x-hidden transition-colors duration-500">
      
      {/* Background ambient radial glowing color aura */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-10 pointer-events-none transition-all duration-1000 ease-in-out left-1/2 -translate-x-1/2"
        style={{
          backgroundColor: viewMode === 'gateway' ? '#60A5FA' : getAlertColor(activeZoneData.alertLevel),
          top: '-150px'
        }}
      />

      {/* ========================================================
          GATEWAY SCREEN (Clean welcome page with two choices)
          ======================================================== */}
      {/* FLOATING WEATHER BACKGROUND PARTICLES (Floats across entire screen and blurs behind central cards) */}
      {viewMode === 'gateway' && (
        <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none" style={{ maskImage: 'radial-gradient(ellipse 75% 60% at 50% 50%, transparent 28%, black 65%)', WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 50%, transparent 28%, black 65%)' }}>
          {/* Cloud 1 */}
          <div className="absolute top-[10%] left-[8%] text-[#60A5FA]/20 animate-float-slow transform scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.48 0-.96.06-1.4.17A5.5 5.5 0 0 0 4 13.5a3.5 3.5 0 0 0 3.5 3.5h10Z"/></svg>
          </div>
          {/* Sun */}
          <div className="absolute top-[20%] right-[12%] text-[#F59E0B]/15 animate-float-medium transform scale-125">
            <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          </div>
          {/* Raindrop 1 */}
          <div className="absolute bottom-[25%] left-[15%] text-[#60A5FA]/25 animate-float-fast transform scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
          </div>
          {/* Raindrop 2 */}
          <div className="absolute top-[45%] left-[25%] text-[#60A5FA]/20 animate-float-slow transform scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
          </div>
          {/* Cloud 2 */}
          <div className="absolute bottom-[15%] right-[18%] text-[#9CA3AF]/15 animate-float-slow transform scale-125">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/><path d="M20 19.5A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 19.5c0 .28.22.5.5.5h15c.28 0 .5-.22.5-.5z"/></svg>
          </div>
          {/* Lightning Bolt */}
          <div className="absolute top-[55%] right-[30%] text-[#F59E0B]/20 animate-float-fast transform scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          {/* Drizzle Cloud */}
          <div className="absolute top-[60%] left-[10%] text-[#60A5FA]/15 animate-float-medium transform scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><path d="M8 19v2"/><path d="M12 21v2"/><path d="M16 19v2"/></svg>
          </div>
          {/* Extra top-right Cloud */}
          <div className="absolute top-[5%] right-[25%] text-[#60A5FA]/12 animate-float-medium transform scale-150">
            <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.48 0-.96.06-1.4.17A5.5 5.5 0 0 0 4 13.5a3.5 3.5 0 0 0 3.5 3.5h10Z"/></svg>
          </div>
          {/* Extra bottom-left Raindrop */}
          <div className="absolute bottom-[10%] left-[40%] text-[#60A5FA]/18 animate-float-slow transform scale-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
          </div>
        </div>
      )}

      {/* ========================================================
          GATEWAY SCREEN (Clean welcome page with two choices)
          ======================================================= */}
      {viewMode === 'gateway' && (
        <div className="relative flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col justify-center items-center z-10 animate-fade-in min-h-[85vh]">
          {/* Minimalist Landing */}
          <div className="w-full max-w-lg p-6 sm:p-10 relative z-10 flex flex-col items-center space-y-6 sm:space-y-8">
            
            {/* Brand Title Group - Centered and balanced */}
            <div className="flex flex-col items-center w-full space-y-4">
              {/* Typography Section */}
              <div className="text-center space-y-3">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none flex items-center justify-center gap-2">
                  F.L.O.W.S.
                  <span className="relative flex h-3 w-3 sm:h-4 sm:w-4 -mt-2 sm:-mt-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-teal-500"></span>
                  </span>
                </h1>
                {/* Tagline: design-aligned slate color instead of blue */}
                <p className="text-[10px] sm:text-xs font-black text-slate-400 max-w-sm mx-auto leading-relaxed uppercase tracking-[0.2em] select-none mt-2">
                  Flood Level Observation and Warning System
                </p>
              </div>
            </div>

            {/* Restored Mini Description with Typing Animation - Smaller, elegant supporting text */}
            <div className="pt-2 w-full max-w-md mx-auto space-y-3 text-center">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto" />
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 leading-relaxed font-medium select-none min-h-[120px] sm:min-h-[90px] md:min-h-[75px] transition-all duration-300">
                {displayedText}
              </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="w-full flex flex-col sm:flex-row gap-4 pt-4">
              
              {/* Choice 1: Resident Dashboard */}
              <button 
                onClick={enterDashboard}
                className="flex-1 bg-[#4F7CAC] hover:bg-[#3B628A] rounded-2xl py-4 px-6 text-center transition-all duration-300 shadow-xl group flex items-center justify-center gap-3 cursor-pointer"
              >
                <CloudRain size={20} className="group-hover:scale-110 transition-transform duration-200 text-slate-950" />
                <span className="text-sm font-black leading-tight select-none text-slate-950">
                  View Dashboard
                </span>
              </button>

              {/* Choice 2: Login System */}
              <Link 
                href="/admin/login"
                className="flex-1 bg-[#1E2229] hover:bg-slate-800 border border-slate-800 rounded-2xl py-4 px-6 text-center transition-all duration-300 shadow-sm hover:shadow-md group flex items-center justify-center gap-3 cursor-pointer"
              >
                <Lock size={20} className="text-slate-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-bold leading-tight">
                  Admin Login
                </span>
              </Link>
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================================
          RESPONSIVE RESIDENT DASHBOARD & OBSERVED SECTORS
          ======================================================== */}
      {viewMode === 'dashboard' && (
        <div className="flex-1 flex flex-col animate-fade-in">
          
          {/* TOP NAVBAR (Gives smooth desktop integration and dynamic time/flag indicators) */}
          <header className="bg-[#111827]/95 border-b border-[#374151]/70 sticky top-0 z-30 px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 backdrop-blur-md shadow-lg transition-all duration-300">
            
            {/* Branding Logo */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#1F2937] border border-[#374151] overflow-hidden flex items-center justify-center shrink-0 p-1">
                  <img src="/flowsnoname.png" alt="FLOWS Logo" className="w-full h-full object-contain transition-transform" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                    F.L.O.W.S.
                    <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full animate-ping"></span>
                  </h1>
                  <p className="text-[8px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">
                    Flood Level Observation and Warning System
                    {isLiveData && (
                      <span className="ml-1.5 text-[#4ADE80] bg-[#4ADE80]/10 px-1 rounded" title="Connected to live backend">● LIVE</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Mobile Right Quick Controls */}
              <div className="flex md:hidden items-center gap-1.5">
                <button 
                  onClick={enterGateway}
                  className="p-1.5 bg-[#1F2937] border border-[#374151] rounded-lg text-[#9CA3AF] hover:text-white flex items-center justify-center cursor-pointer"
                  title="Back to Landing Page"
                >
                  <Home size={13} />
                </button>
              </div>
            </div>

            {/* DESKTOP INTEGRATED NAVIGATION TABS */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#1F2937]/50 border border-[#374151]/50 p-1 rounded-xl">
              <button
                onClick={() => changeTab('weather')}
                className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                  activeTab === 'weather' ? 'bg-[#111827] text-[#60A5FA]' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Weather
              </button>
              <button
                onClick={() => changeTab('zones')}
                className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                  activeTab === 'zones' ? 'bg-[#111827] text-[#60A5FA]' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Zones Overview
              </button>
              <button
                onClick={() => changeTab('alerts')}
                className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                  activeTab === 'alerts' ? 'bg-[#111827] text-[#60A5FA]' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                User Guide
              </button>
              <button
                onClick={() => changeTab('emergency')}
                className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                  activeTab === 'emergency' ? 'bg-[#111827] text-[#EF4444]' : 'text-[#9CA3AF] hover:text-[#EF4444]'
                }`}
              >
                Emergency Hub
              </button>
            </nav>

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

              {/* Back to Landing Page Button positioned at the very right */}
              <button 
                onClick={enterGateway}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#60A5FA]/40 rounded-xl text-xs font-black text-[#F9FAFB] hover:text-white transition-all shadow-md group shrink-0 cursor-pointer"
                title="Back to Landing Page"
              >
                <span>Back to Landing</span>
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

          {/* MAIN WEB DASHBOARD GRID */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 min-h-[60vh] animate-fade-in relative">
              {/* Tech glow background */}
              <div className="absolute w-72 h-72 rounded-full bg-[#60A5FA] blur-[120px] opacity-10 pointer-events-none" />
              
              <div className="w-full max-w-md bg-[#1F2937]/45 border border-[#374151]/60 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative z-10 text-center space-y-6 weather-glow-blue">
                {/* Dynamic Animated Radar Grid / Spinner */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  {/* Outer rotating pulse ring */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#60A5FA]/30 animate-spin" style={{ animationDuration: '8s' }} />
                  {/* Inner pulsing aura */}
                  <div className="absolute w-16 h-16 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/20 animate-pulse" />
                  {/* Center logo icon with waves */}
                  <div className="relative bg-[#111827] p-3 rounded-2xl border border-[#374151] shadow-xl w-14 h-14 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                    <img src="/flowsnoname.png" alt="FLOWS Logo" className="w-full h-full object-contain animate-pulse" />
                  </div>
                </div>
                
                {/* Typography */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                    Loading Forecast...
                  </h3>
                  <p className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-ping" />
                    Synchronizing Live Telemetry
                  </p>
                </div>

                {/* Decorative skeleton layout representation to show "forecast is mapping" */}
                <div className="pt-4 border-t border-[#374151]/40 space-y-2">
                  <div className="h-1.5 w-3/4 bg-[#111827] rounded mx-auto animate-pulse" />
                  <div className="h-1.5 w-1/2 bg-[#111827] rounded mx-auto animate-pulse" style={{ animationDelay: '200ms' }} />
                </div>
              </div>
            </div>
          ) : isBackendOffline ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 min-h-[60vh] animate-fade-in relative z-10">
              {/* Tech glow background */}
              <div className="absolute w-72 h-72 rounded-full bg-[#EF4444] blur-[120px] opacity-5 pointer-events-none" />
              
              <div className="w-full max-w-md bg-[#1F2937]/45 border border-red-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-center space-y-6 weather-glow-red">
                {/* Warning Icon */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-red-500/30 animate-spin" style={{ animationDuration: '12s' }} />
                  <div className="absolute w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse" />
                  <div className="relative text-red-500 animate-bounce" style={{ animationDuration: '3s' }}>
                    <AlertTriangle size={32} />
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                    System Under Maintenance
                  </h3>
                  <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider flex items-center justify-center gap-1.5 font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    Telemetry Stream Offline
                  </p>
                </div>

                <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-xs mx-auto">
                  The Barangay Rizal telemetry servers are currently undergoing scheduled network maintenance. Active sensor updates are temporarily unavailable.
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      setIsLoading(true);
                      loadLiveData();
                    }}
                    className="flex-1 py-3 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/15 cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Retry Sync</span>
                  </button>
                  
                  <button 
                    onClick={enterGateway}
                    className="flex-1 py-3 bg-[#111827] hover:bg-slate-800 border border-[#374151] text-slate-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home size={13} />
                    <span>Go Back</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6 z-10 pb-24 md:pb-12">
            
            {/* Header section with zone selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#60A5FA] uppercase tracking-wider block">Observer Dashboard</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight select-none">
                  {activeTab === 'emergency' ? (
                    <span className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span>Emergency Portal & Shelter Status</span>
                      {phDate && (
                        <span className="text-xs sm:text-sm font-normal text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-700 pt-1 sm:pt-0 sm:pl-2.5">
                          {phDate}
                        </span>
                      )}
                    </span>
                  ) : activeTab === 'alerts' ? (
                    <span className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span>System Guidelines & Reference</span>
                      {phDate && (
                        <span className="text-xs sm:text-sm font-normal text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-700 pt-1 sm:pt-0 sm:pl-2.5">
                          {phDate}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>
                      Rainfall Forecast as of <span className="text-[#60A5FA]">{phDate || 'Today'}</span>
                    </span>
                  )}
                </h2>
              </div>

              {/* Responsive Zone Selector Dropdown */}
              {activeTab === 'weather' ? (
                <div className="relative w-full md:w-72">
                  <label className="block text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
                    Active Monitoring Zone
                  </label>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1F2937] border border-[#374151] rounded-xl text-left shadow-lg focus:outline-none focus-visible:outline-none focus:ring-0 hover:bg-[#253245] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full animate-pulse-slow"
                        style={{ backgroundColor: getAlertColor(activeZoneData.alertLevel) }}
                      />
                      <div>
                        <div className="text-xs font-black text-white">{activeZoneData.name}</div>
                        <div className="text-[10px] text-[#9CA3AF]">{activeZoneData.purok}</div>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-[#9CA3AF] transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Options panel */}
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                      <div className="absolute right-0 left-0 mt-2 bg-[#1F2937] border border-[#374151] rounded-xl shadow-2xl overflow-hidden z-20">
                        <div className="py-1 max-h-60 overflow-y-auto">
                          {liveZoneKeys.map((key) => { const zone = zonesData[key]; if (!zone) return null; return (
                            <button
                              key={zone.id}
                              onClick={() => {
                                setSelectedZone(zone.id);
                                setShowDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#374151]/50 text-left transition-colors cursor-pointer ${
                                selectedZone === zone.id ? 'bg-[#374151] text-white' : 'text-[#9CA3AF]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getAlertColor(zone.alertLevel) }} />
                                <div>
                                  <div className="text-xs font-bold text-white">{zone.name}</div>
                                  <div className="text-[10px] text-[#9CA3AF]">{zone.purok}</div>
                                </div>
                              </div>
                              <div className="text-right font-mono text-xs font-bold text-white">{zone.amount} mm</div>
                            </button>
                          ); })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : activeTab === 'alerts' ? (
                <div className="w-full text-left text-[10px] text-[#60A5FA] font-black uppercase tracking-wider bg-[#60A5FA]/10 border border-[#60A5FA]/20 px-3.5 py-2.5 rounded-xl flex items-center justify-start gap-2 h-[46px]">
                  <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
                  <span>System Reference Manual</span>
                </div>
              ) : activeTab === 'emergency' ? (
                <div className="w-full text-left text-[10px] text-[#EF4444] font-black uppercase tracking-wider bg-[#EF4444]/10 border border-[#EF4444]/20 px-3.5 py-2.5 rounded-xl flex items-center justify-start gap-2 h-[46px]">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                  <span>Rizal Emergency Portal</span>
                </div>
              ) : null}
            </div>

            {/* TAB VIEW MODE RESOLUTION */}
            
            {/* ========================================================
                TAB 1: WEATHER OBSERVED PANEL (Bento Grid)
                ======================================================== */}
            {activeTab === 'weather' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                
                {/* Bento Card 1: Rain Status (Span 2) */}
                <div className={`md:col-span-2 weather-glass rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 ${getGlowClass(activeZoneData.alertLevel)}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block">SENSOR STATUS ARRAY</span>
                      <h3 className="text-2xl font-black text-white tracking-tight">{activeZoneData.status.toUpperCase()}</h3>
                      <p className="text-xs text-[#9CA3AF] leading-snug">
                        Continuous radar classification and telemetry reports.
                      </p>
                    </div>
                    <div className="p-3 bg-[#111827]/60 border border-[#374151]/60 rounded-2xl animate-wave-slow">
                      {getWeatherIcon(activeZoneData.status, 40)}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#374151]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: getAlertColor(activeZoneData.alertLevel) }} />
                      <span className="font-extrabold text-[12px]" style={{ color: getAlertColor(activeZoneData.alertLevel) }}>
                        {activeZoneData.alertText}
                      </span>
                    </div>
                    {activeZoneData.forecastTime && (
                      <div className="text-right flex flex-col items-end gap-0.5">
                        <span className="text-[9px] text-[#60A5FA] font-bold uppercase tracking-wider bg-[#60A5FA]/10 border border-[#60A5FA]/20 px-2 py-0.5 rounded" title="Timestamp of the latest Open-Meteo hourly forecast log">
                          Forecast Target: {new Date(activeZoneData.forecastTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        {activeZoneData.fetchedAt && (
                          <span className="text-[8px] text-[#9CA3AF] font-medium uppercase tracking-wider">
                            Synced: {new Date(activeZoneData.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bento Card 2: Evacuation shelter badge (Span 1) */}
                <div className="md:col-span-1 weather-glass rounded-2xl p-5 flex flex-col justify-between hover:border-[#EF4444]/40 transition-colors">
                  <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block">EVACUATION READINESS</span>
                  
                  <div className="my-4 flex items-center gap-3">
                    {activeZoneData.evacuationRecommended ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444] animate-pulse">
                          <ShieldAlert size={22} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#EF4444] uppercase tracking-tight">Active Warning</div>
                          <div className="text-[10px] text-[#9CA3AF]">Immediate Shelter Suggested</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#4ADE80]/20 flex items-center justify-center text-[#4ADE80]">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#4ADE80] uppercase tracking-tight">Shelter Safe</div>
                          <div className="text-[10px] text-[#9CA3AF]">No Threat Present</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-[#9CA3AF] font-bold border-t border-[#374151]/50 pt-3">
                    Barangay Gym Status: <span className="text-[#60A5FA]">OPEN (42% Capacity)</span>
                  </div>
                </div>

                {/* Bento Card 3: Rainfall Amount (Span 1) */}
                <div className="md:col-span-1 weather-glass rounded-2xl p-5 flex flex-col justify-between hover:border-[#60A5FA]/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">RAINFALL AMOUNT</span>
                    <CloudRain size={16} className="text-[#60A5FA]" />
                  </div>
                  <div className="my-4">
                    <h4 className="text-4xl font-black text-white font-mono tracking-tight">
                      {activeZoneData.amount}
                      <span className="text-base font-bold text-[#9CA3AF] ml-1">mm</span>
                    </h4>
                  </div>
                  <div className="text-[9px] font-bold text-[#4ADE80] bg-[#4ADE80]/10 py-1.5 px-2 rounded-xl text-center flex items-center justify-center gap-1.5">
                    <TrendingUp size={11} />
                    <span>{activeZoneData.amountTrend}</span>
                  </div>
                </div>

                {/* Bento Card 4: Rain Duration (Span 1) */}
                <div className="md:col-span-1 weather-glass rounded-2xl p-5 flex flex-col justify-between hover:border-[#F59E0B]/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">RAIN CONTINUITY</span>
                    <Timer size={16} className="text-[#F59E0B]" />
                  </div>
                  <div className="my-4">
                    <h4 className="text-4xl font-black text-white font-mono tracking-tight">
                      {activeZoneData.duration}
                    </h4>
                  </div>
                  <div className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider bg-[#111827]/40 py-1.5 px-2 rounded-xl text-center">
                    Continuous Precipitation
                  </div>
                </div>

                {/* Bento Card 5: Saturation / Humidity (Span 1) */}
                <div className="md:col-span-1 weather-glass rounded-2xl p-5 flex flex-col justify-between hover:border-[#A78BFA]/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">ATMOSPHERIC HUMIDITY</span>
                    <Droplets size={16} className="text-[#A78BFA]" />
                  </div>
                  <div className="my-4">
                    <h4 className="text-4xl font-black text-white font-mono tracking-tight">
                      {activeZoneData.humidity}
                      <span className="text-base font-bold text-[#9CA3AF] ml-1">%</span>
                    </h4>
                  </div>
                  <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#A78BFA] h-full rounded-full" style={{ width: `${activeZoneData.humidity}%` }} />
                  </div>
                </div>

                {/* Bento Card 6: 24-Hour Trend Graph (Span 3) */}
                <div className="md:col-span-3 weather-glass rounded-2xl p-5 flex flex-col justify-between hover:border-[#60A5FA]/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block">OBSERVATIONAL METRICS LOG</span>
                      <h4 className="text-sm font-black text-white">24-Hour Cumulative Precipitation Timeline</h4>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#111827]/80 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-[#60A5FA]">
                      <Activity size={10} />
                      <span>Telemetric Feeds</span>
                    </div>
                  </div>

                  {/* SVG Mini Bar Graph */}
                  <div className="mt-4 flex items-end justify-between h-24 px-2 bg-[#111827]/40 rounded-xl py-3 border border-[#374151]/30">
                    {activeZoneData.trend.map((val, idx) => {
                      const heightPercent = Math.max(12, Math.min(100, (val / 35) * 100));
                      let barColor = '#60A5FA';
                      if (val > 25) barColor = '#EF4444';
                      else if (val > 15) barColor = '#F97316';
                      else if (val > 10) barColor = '#F59E0B';
                      else if (val > 5) barColor = '#4ADE80';
                      
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 group relative mx-0.5">
                          <div className="absolute bottom-full mb-1 bg-[#1F2937] border border-[#374151] text-[8px] font-bold text-white rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 font-mono shadow-md">
                            {val} mm
                          </div>
                          <div 
                            className="w-full rounded-t transition-all duration-500 ease-out"
                            style={{ 
                              height: `${heightPercent}%`, 
                              backgroundColor: barColor 
                            }}
                          />
                          <span className="text-[7px] text-[#9CA3AF] mt-1 font-mono">{idx * 2}h</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[9px] text-[#9CA3AF] font-bold">
                    <span>Past 24 Hours Sync Logs</span>
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Critical</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> Heavy</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" /> Moderate</span>
                    </div>
                  </div>
                </div>

                {/* Bento Card 7: Alert Warnings Advisory Card (Span 3) */}
                <div 
                  className="md:col-span-3 rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.6)',
                    borderColor: getAlertColor(activeZoneData.alertLevel) + '40',
                  }}
                >
                  <div className="absolute top-0 bottom-0 left-0 w-1.5" style={{ backgroundColor: getAlertColor(activeZoneData.alertLevel) }} />
                  
                  <div className="flex items-start gap-4 pl-2">
                    <div className="mt-0.5 animate-pulse text-white">
                      <AlertTriangle size={24} style={{ color: getAlertColor(activeZoneData.alertLevel) }} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: getAlertColor(activeZoneData.alertLevel) }}>
                        Official Telemetry Advisory Warning
                      </h4>
                      <p className="text-xs font-normal text-white leading-relaxed">
                        {activeZoneData.advisoryText}
                      </p>
                      
                      <div className="pt-2 border-t border-[#374151]/50 space-y-1">
                        <div className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wide mb-1">Evacuation Protocols:</div>
                        {activeZoneData.alertLevel === 'Red' && (
                          <>
                            <div className="flex items-center gap-2 text-[10px] text-[#EF4444] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Head safely to Rizal Multipurpose Gym immediately.
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#EF4444] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Cut off household electrical circuits.
                            </div>
                          </>
                        )}
                        {activeZoneData.alertLevel === 'Orange' && (
                          <>
                            <div className="flex items-center gap-2 text-[10px] text-[#F97316] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" /> Move electrical items and appliances to higher counters.
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#F97316] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" /> Pack emergency grab bags and check battery backups.
                            </div>
                          </>
                        )}
                        {(activeZoneData.alertLevel === 'Yellow' || activeZoneData.alertLevel === 'Green') && (
                          <>
                            <div className="flex items-center gap-2 text-[10px] text-[#F59E0B] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> Charge battery packs, smart devices, and flashlights.
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" /> Monitor landslide-prone slopes continuously.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
                TAB 2: ZONES OVERVIEW LIST
                ======================================================== */}
            {activeTab === 'zones' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <MapPin size={20} className="text-[#60A5FA]" />
                    Barangay Rizal Monitored Areas
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">
                    Status ledger for all active automated telemetry sensor grids.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {liveZoneKeys.map((key) => { const zone = zonesData[key]; if (!zone) return null;
                    const isSelected = zone.id === selectedZone;
                    return (
                      <div 
                        key={zone.id}
                        onClick={() => setSelectedZone(zone.id)}
                        className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-lg cursor-pointer ${
                          isSelected 
                            ? 'bg-[#1F2937] border-2 scale-[1.03] shadow-2xl' 
                            : 'bg-[#1F2937]/50 border-2 border-[#374151] hover:bg-[#1F2937]/80 hover:scale-[1.01]'
                        }`}
                        style={{
                          borderColor: isSelected ? getAlertColor(zone.alertLevel) : '#374151',
                          boxShadow: isSelected 
                            ? `0 0 0 2px ${getAlertColor(zone.alertLevel)}, 0 0 25px ${getAlertColor(zone.alertLevel)}30` 
                            : 'none'
                        }}
                      >
                        <div className="flex justify-between items-start pb-3 border-b border-[#374151]/50">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-white">{zone.name}</h4>
                              {isSelected && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#60A5FA] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#60A5FA]"></span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#9CA3AF]">{zone.purok}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="text-[8px] font-black uppercase bg-[#60A5FA]/20 text-[#60A5FA] px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                                Selected
                              </span>
                            )}
                            <span 
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: getAlertColor(zone.alertLevel) }}
                            />
                          </div>
                        </div>

                        <div className="my-4 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-[#9CA3AF] uppercase block">PRECIPITATION</span>
                            <span className="text-xl font-black text-white font-mono">{zone.amount} mm</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-[#9CA3AF] uppercase block">WARNING LEVEL</span>
                            <span className="text-xs font-black uppercase" style={{ color: getAlertColor(zone.alertLevel) }}>
                              {zone.alertLevel} Alert
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedZone(zone.id);
                            setActiveTab('weather');
                          }}
                          className={`w-full py-1.5 font-bold text-[10px] uppercase rounded-xl transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#60A5FA] hover:bg-[#60A5FA]/90 text-white border-transparent shadow-md'
                              : 'bg-[#111827]/40 hover:bg-[#111827] text-[#60A5FA] border-[#374151]'
                          }`}
                        >
                          <span>Focus Zone Dashboard</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 3: ALERTS THRESHOLDS SUMMARY
                ======================================================== */}
            {/* ========================================================
                TAB 3: VISUAL USER GUIDE SECTION (Jargon-free explanations & limits)
                ======================================================== */}
            {activeTab === 'alerts' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Header info */}
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <Info size={20} className="text-[#60A5FA]" />
                    F.L.O.W.S. System Reference Guide
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">
                    A visual user manual explaining how our automated sensors track and report local storm events.
                  </p>
                </div>

                {/* Main Visual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Column 1 & 2: Understanding Your Weather Cards */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
                      Understanding Your Weather Cards
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Card 1: Rain Status */}
                      <div className="weather-glass rounded-2xl p-4 border border-[#374151]/50 space-y-2 hover:border-[#60A5FA]/30 transition-colors">
                        <div className="flex items-center gap-2.5 text-[#60A5FA]">
                          <div className="p-2 bg-[#60A5FA]/10 rounded-xl">
                            <CloudRain size={18} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-white">Rain Status</span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                          Tells you whether it is currently dry, overcast, or raining heavily in your purok. It receives constant telemetry from our automated radar and sensor node.
                        </p>
                      </div>

                      {/* Card 2: Rainfall Amount */}
                      <div className="weather-glass rounded-2xl p-4 border border-[#374151]/50 space-y-2 hover:border-[#60A5FA]/30 transition-colors">
                        <div className="flex items-center gap-2.5 text-[#4ADE80]">
                          <div className="p-2 bg-[#4ADE80]/10 rounded-xl">
                            <Droplets size={18} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-white">Rainfall Amount</span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                          Measures the height of water (in millimeters) accumulated on flat land over the last hour. A higher number signals a heavier rate of storm-water build-up.
                        </p>
                      </div>

                      {/* Card 3: Continuity */}
                      <div className="weather-glass rounded-2xl p-4 border border-[#374151]/50 space-y-2 hover:border-[#F59E0B]/30 transition-colors">
                        <div className="flex items-center gap-2.5 text-[#F59E0B]">
                          <div className="p-2 bg-[#F59E0B]/10 rounded-xl">
                            <Timer size={18} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-white">Rain Continuity</span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                          Tracks exactly how long the rain has been falling continuously without stopping. Prolonged rainfall fills local drains and increases landslide risk on hillsides.
                        </p>
                      </div>

                      {/* Card 4: Saturation */}
                      <div className="weather-glass rounded-2xl p-4 border border-[#374151]/50 space-y-2 hover:border-[#A78BFA]/30 transition-colors">
                        <div className="flex items-center gap-2.5 text-[#A78BFA]">
                          <div className="p-2 bg-[#A78BFA]/10 rounded-xl">
                            <Activity size={18} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-white">Air Moisture (Humidity)</span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                          Checks the amount of water vapor in the atmosphere. High moisture percentages mean that dense clouds are locked in, meaning the rain will likely continue.
                        </p>
                      </div>

                      {/* Card 5: Trend Timeline */}
                      <div className="weather-glass rounded-2xl p-4 border border-[#374151]/50 space-y-2 hover:border-[#60A5FA]/30 transition-colors sm:col-span-2">
                        <div className="flex items-center gap-2.5 text-[#60A5FA]">
                          <div className="p-2 bg-[#60A5FA]/10 rounded-xl">
                            <TrendingUp size={18} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-white">24-Hour Precipitation Trend</span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                          A visual record showing cumulative telemetry logs hour-by-hour. This history helps you see if the storm is steadily growing stronger, remaining stable, or beginning to fade.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Column 3: Alert Severities & Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
                      Alert Severity Indicators
                    </h4>
                    
                    <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 space-y-4 shadow-xl">
                      
                      {/* Green */}
                      <div className="flex gap-3 items-start pb-3 border-b border-[#374151]/50">
                        <span className="w-6 h-6 rounded-full bg-[#4ADE80]/15 flex items-center justify-center font-bold text-[10px] text-[#4ADE80] shrink-0 border border-[#4ADE80]/30 mt-0.5">G</span>
                        <div>
                          <h5 className="text-[11px] font-black text-[#4ADE80] uppercase">Green (Normal)</h5>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">Safe weather index. Telemetry checks are healthy. Local routines flow normally.</p>
                        </div>
                      </div>

                      {/* Yellow */}
                      <div className="flex gap-3 items-start pb-3 border-b border-[#374151]/50">
                        <span className="w-6 h-6 rounded-full bg-[#F59E0B]/15 flex items-center justify-center font-bold text-[10px] text-[#F59E0B] shrink-0 border border-[#F59E0B]/30 mt-0.5">Y</span>
                        <div>
                          <h5 className="text-[11px] font-black text-[#F59E0B] uppercase">Yellow (Monitor)</h5>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">Rains starting to pick up. Local drains are monitored and hillside checks are active.</p>
                        </div>
                      </div>

                      {/* Orange */}
                      <div className="flex gap-3 items-start pb-3 border-b border-[#374151]/50">
                        <span className="w-6 h-6 rounded-full bg-[#F97316]/15 flex items-center justify-center font-bold text-[10px] text-[#F97316] shrink-0 border border-[#F97316]/30 mt-0.5">O</span>
                        <div>
                          <h5 className="text-[11px] font-black text-[#F97316] uppercase">Orange (Prepare)</h5>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">Very heavy rains. Move valuable home appliances to higher counters and pack emergency go bags.</p>
                        </div>
                      </div>

                      {/* Red */}
                      <div className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-[#EF4444]/15 flex items-center justify-center font-bold text-[10px] text-[#EF4444] shrink-0 border border-[#EF4444]/30 mt-0.5">R</span>
                        <div>
                          <h5 className="text-[11px] font-black text-[#EF4444] uppercase">Red (Evacuate)</h5>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">Critical flooding risk. Turn off your main household electricity breaker and head immediately to the Multipurpose Gym.</p>
                        </div>
                      </div>

                    </div>

                    {/* Timeline Feed */}
                    <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 space-y-4 shadow-xl">
                      <h5 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider pb-2 border-b border-[#374151]">
                        Barangay Telemetry Timeline
                      </h5>
                      <div className="relative pl-4 border-l border-[#374151] space-y-4 ml-1">
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#EF4444]" />
                          <div className="text-[9px] text-[#EF4444] font-black uppercase">Red Alert Triggered • 9:45 PM</div>
                          <p className="text-[10px] text-white font-bold leading-relaxed mt-0.5">Zone 1 Riverside sensor exceeded critical threshold.</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#F97316]" />
                          <div className="text-[9px] text-[#F97316] font-black uppercase">Orange Alert Triggered • 9:15 PM</div>
                          <p className="text-[10px] text-white font-bold leading-relaxed mt-0.5">Zone 3 precipitation hit 22.1 mm.</p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ========================================================
                TAB 4: EMERGENCY HUB SECTION (Integrated client-side rescue portal)
                ======================================================== */}
            {activeTab === 'emergency' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Title */}
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <ShieldAlert size={20} className="text-[#EF4444] animate-pulse" />
                    Barangay Rizal Rescue & Disaster Services
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">
                    Official emergency hotlines, shelter statuses, and safety checklists for residents.
                  </p>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Column 1: Shelters */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
                      Designated Evacuation Shelters
                    </h4>
                    
                    {/* Gym */}
                    <div 
                      onClick={() => setActiveCenter('center-1')}
                      className={`bg-[#1F2937] border p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                        activeCenter === 'center-1' ? 'border-[#60A5FA] weather-glow-blue scale-[1.02]' : 'border-[#374151] hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5">
                          <MapPin size={18} className="text-[#60A5FA] mt-0.5" />
                          <div>
                            <h5 className="text-xs font-black text-white">Barangay Rizal Multipurpose Gym</h5>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">High School Complex (Elevated Ground)</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black text-[#4ADE80] bg-[#4ADE80]/10 px-2 py-0.5 rounded-full shrink-0">ACTIVE</span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#374151]/50 flex justify-between items-center text-[10px] text-[#9CA3AF]">
                        <span>Capacity Filled: <strong className="text-white">42% (210 / 500)</strong></span>
                        <div className="w-16 bg-[#111827] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#F59E0B] h-full" style={{ width: '42%' }} />
                        </div>
                      </div>
                    </div>

                    {/* School Annex */}
                    <div 
                      onClick={() => setActiveCenter('center-2')}
                      className={`bg-[#1F2937] border p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                        activeCenter === 'center-2' ? 'border-[#60A5FA] weather-glow-blue scale-[1.02]' : 'border-[#374151] hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5">
                          <MapPin size={18} className="text-[#A78BFA] mt-0.5" />
                          <div>
                            <h5 className="text-xs font-black text-white">Rizal Elementary School Annex</h5>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">Central Plaza Grounds (Elevated Annex)</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black text-[#4ADE80] bg-[#4ADE80]/10 px-2 py-0.5 rounded-full shrink-0">ACTIVE</span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#374151]/50 flex justify-between items-center text-[10px] text-[#9CA3AF]">
                        <span>Capacity Filled: <strong className="text-white">15% (45 / 300)</strong></span>
                        <div className="w-16 bg-[#111827] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#4ADE80] h-full" style={{ width: '15%' }} />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Column 2: Hotlines */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
                      Clickable Telephone Links
                    </h4>
                    
                    <div className="flex flex-col gap-3">
                      
                      <a 
                        href="tel:5557492"
                        className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#60A5FA]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                            <Users size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white leading-tight">Barangay Rescue</h5>
                            <span className="text-[10px] text-[#9CA3AF]">Command Headquarters</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#60A5FA] font-mono bg-[#60A5FA]/10 py-1 px-2.5 rounded-lg">555-7492</span>
                      </a>

                      <a 
                        href="tel:0498291111"
                        className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#EF4444]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                            <ShieldAlert size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white leading-tight">MDRRMO HQ</h5>
                            <span className="text-[10px] text-[#9CA3AF]">Disaster Response HQ</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#EF4444] font-mono bg-[#EF4444]/10 py-1 px-2.5 rounded-lg">(049) 829-1111</span>
                      </a>

                      <a 
                        href="tel:5557654"
                        className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#A78BFA]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                            <Users size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white leading-tight">Rizal Police Desk</h5>
                            <span className="text-[10px] text-[#9CA3AF]">Police Sub-station</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#A78BFA] font-mono bg-[#A78BFA]/10 py-1 px-2.5 rounded-lg">555-7654</span>
                      </a>

                      <a 
                        href="tel:5553473"
                        className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#F97316]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                            <Flame size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white leading-tight">Rizal BFP Fire Desk</h5>
                            <span className="text-[10px] text-[#9CA3AF]">Fire Emergencies</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#F97316] font-mono bg-[#F97316]/10 py-1 px-2.5 rounded-lg">555-3473</span>
                      </a>

                    </div>
                  </div>

                  {/* Column 3: Reminders */}
                  <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 space-y-4 shadow-xl h-fit">
                    <h4 className="text-xs font-black uppercase text-white tracking-wider pb-2 border-b border-[#374151] flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-[#F59E0B] animate-pulse" />
                      Evacuation Reminders
                    </h4>

                    <div className="space-y-4 text-xs leading-relaxed">
                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444] font-bold text-[10px] shrink-0">1</span>
                        <div>
                          <span className="font-extrabold text-white block">Go Bag Packing</span>
                          <span className="text-[#9CA3AF]">Pack light: gather clean water (1L/person), canned foods, essential medicines, cash, and ID documents in zip bags.</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B] font-bold text-[10px] shrink-0">2</span>
                        <div>
                          <span className="font-extrabold text-white block">Circuit Breaker & LPG</span>
                          <span className="text-[#9CA3AF]">Turn off the main electrical breaker switch and gas valves before leaving to protect against fires or live wiring.</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#4ADE80]/15 flex items-center justify-center text-[#4ADE80] font-bold text-[10px] shrink-0">3</span>
                        <div>
                          <span className="font-extrabold text-white block">Official Shelters Only</span>
                          <span className="text-[#9CA3AF]">Proceed only to Barangay designated elevated evacuation centers. Avoid taking low-lying pathways.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            </main>
          )}

        </div>
      )}

      {/* DOCK-STABLE BOTTOM NAVIGATION BAR ON MOBILE DEVICES (Hidden on Desktop) */}
      {viewMode === 'dashboard' && !isLoading && (
        <div className="flows-fixed-nav pb-[env(safe-area-inset-bottom)] bg-[#111827]/95 border-t border-[#374151]/80 backdrop-blur-lg shadow-2xl">
          <nav className="flex justify-around items-center px-2 py-2">
            
            <button 
              onClick={() => changeTab('weather')}
              className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
                activeTab === 'weather' ? 'text-[#60A5FA] font-black' : 'text-[#9CA3AF]'
              }`}
            >
              <CloudRain size={18} className={activeTab === 'weather' ? 'animate-bounce' : ''} />
              <span className="text-[9px] font-bold mt-1 tracking-wide">Weather</span>
            </button>

            <button 
              onClick={() => changeTab('zones')}
              className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
                activeTab === 'zones' ? 'text-[#60A5FA] font-black' : 'text-[#9CA3AF]'
              }`}
            >
              <MapPin size={18} className={activeTab === 'zones' ? 'animate-bounce' : ''} />
              <span className="text-[9px] font-bold mt-1 tracking-wide">Zones</span>
            </button>

            <button 
              onClick={() => changeTab('alerts')}
              className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
                activeTab === 'alerts' ? 'text-[#60A5FA] font-black' : 'text-[#9CA3AF]'
              }`}
            >
              <Bell size={18} className={activeTab === 'alerts' ? 'animate-bounce' : ''} />
              <span className="text-[9px] font-bold mt-1 tracking-wide">Guide</span>
            </button>

            <button 
              onClick={() => changeTab('emergency')}
              className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${
                activeTab === 'emergency' ? 'text-[#EF4444] font-black' : 'text-[#9CA3AF]'
              }`}
            >
              <ShieldAlert size={18} className={activeTab === 'emergency' ? 'animate-bounce' : ''} />
              <span className="text-[9px] font-bold mt-1 tracking-wide">Emergency</span>
            </button>

          </nav>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#111827] border-t border-[#374151] py-4 text-center mt-auto z-10 hidden sm:block">
        <p className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">
          © 2026 F.L.O.W.S. • TELEMETRY HUB • BARANGAY RIZAL LOCAL WARNING AGENCY
        </p>
      </footer>

    </div>
  );
}
