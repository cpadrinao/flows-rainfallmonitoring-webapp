'use client';

import React, { useState, useEffect } from 'react';
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
  Compass
} from 'lucide-react';

// Define TS Interfaces for Zone Weather Data
interface ZoneData {
  id: string;
  name: string;
  purok: string;
  status: 'Heavy Rain' | 'Moderate Rain' | 'Light Rain' | 'Cloudy' | 'Clear';
  alertLevel: 'Red' | 'Orange' | 'Yellow' | 'Green';
  alertText: string;
  advisoryText: string;
  amount: number; // in mm
  amountTrend: string; // "+5.2 mm vs last hr"
  duration: string; // "1h 45m"
  humidity: number; // in %
  trend: number[]; // 12 numbers for 24-hr (2-hr intervals)
  riskLevel: 'Critical' | 'Warning' | 'Monitor' | 'Safe';
  evacuationRecommended: boolean;
}

// Custom mock data mapped by Zone
const ZONES_DATABASE: Record<string, ZoneData> = {
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

export default function FLOWSApp() {
  // Portal vs Dashboard view mode selector
  const [viewMode, setViewMode] = useState<'gateway' | 'dashboard'>('gateway');
  const [activeTab, setActiveTab] = useState<'weather' | 'zones' | 'alerts'>('weather');
  const [selectedZone, setSelectedZone] = useState<string>('zone-1');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  // Date & Time states in Philippine Time
  const [phTime, setPhTime] = useState<string>('');
  const [phDate, setPhDate] = useState<string>('');

  // Handle URL query parameter synchronization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const tab = params.get('tab');
      if (view === 'dashboard') {
        setViewMode('dashboard');
      }
      if (tab === 'weather' || tab === 'zones' || tab === 'alerts') {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const changeTab = (tab: 'weather' | 'zones' | 'alerts') => {
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

  const activeZoneData = ZONES_DATABASE[selectedZone];

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
    <div className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between relative overflow-x-hidden">
      
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
      {viewMode === 'gateway' && (
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col justify-center items-center z-10 space-y-8">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-4 bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-3xl text-[#60A5FA] mb-2 shadow-inner">
              <ShieldAlert size={48} className="animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              F.L.O.W.S.
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#4ADE80]"></span>
              </span>
            </h1>
            <h2 className="text-sm sm:text-base font-bold text-[#9CA3AF] max-w-xl mx-auto leading-relaxed">
              Flood and Local Observatory Warning System for Barangay Rizal
            </h2>
          </div>

          {/* Time & Philippine Standard Time Segment */}
          <div className="w-full max-w-md bg-[#1F2937]/50 border border-[#374151] rounded-2xl p-4 text-center space-y-2 backdrop-blur shadow-lg">
            <div className="flex items-center justify-center gap-2 text-xs font-black tracking-wider text-[#60A5FA]">
              <span className="text-base">🇵🇭</span>
              <span>PHILIPPINE STANDARD TIME (PST)</span>
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-white select-none">
              {phTime || '10:27:00 PM'}
            </div>
            <div className="text-xs text-[#9CA3AF] font-bold flex items-center justify-center gap-1.5">
              <Calendar size={13} className="text-[#9CA3AF]" />
              <span>{phDate || 'Thursday, May 21, 2026'}</span>
            </div>
          </div>

          {/* Main Choices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
            
            {/* CHOICE 1: Resident Observatory Dashboard */}
            <button 
              onClick={enterDashboard}
              className="bg-[#1F2937]/80 hover:bg-[#253245] border border-[#374151] hover:border-[#60A5FA]/40 rounded-2xl p-6 text-left transition-all duration-200 shadow-xl group text-white flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-xl text-[#60A5FA] inline-flex mb-4 group-hover:scale-105 transition-transform">
                  <CloudRain size={24} />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-[#60A5FA] transition-colors leading-tight">
                  View Dashboard for Barangay Rizal
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed mt-2">
                  Access active Doppler precipitation totals, continuous duration stopwatches, hourly bar charts, and official local warning advisories.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#374151]/50 flex items-center justify-between text-xs text-[#60A5FA] font-black w-full">
                <span>Enter Resident Observatory</span>
                <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* CHOICE 2: Log in as Admin */}
            <Link 
              href="/admin/login"
              className="bg-[#1F2937]/80 hover:bg-[#253245] border border-[#374151] hover:border-[#A78BFA]/40 rounded-2xl p-6 text-left transition-all duration-200 shadow-xl group text-white flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-[#A78BFA]/10 border border-[#A78BFA]/20 rounded-xl text-[#A78BFA] inline-flex mb-4 group-hover:scale-105 transition-transform">
                  <Lock size={24} />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-[#A78BFA] transition-colors leading-tight">
                  Log in as System Admin
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed mt-2">
                  Access the administrative control center to configure sensor nodes, calibrate zone boundaries, filter telemetry ledgers, and log manual verifications.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#374151]/50 flex items-center justify-between text-xs text-[#A78BFA] font-black w-full">
                <span>Access Management Portal</span>
                <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

          </div>

          {/* Quick Alert Reminders Callout */}
          <div className="w-full max-w-3xl bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-[#9CA3AF] leading-relaxed">
            <AlertTriangle size={18} className="text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-white">Active Advisory: </span>
              Barangay Rizal’s weather system uses ultrasonic automated rain sensors and Doppler data streams calibrated every 60 seconds to provide safe telemetry to local emergency responders. Always follow municipal instructions.
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          RESPONSIVE RESIDENT DASHBOARD & OBSERVED SECTORS
          ======================================================== */}
      {viewMode === 'dashboard' && (
        <div className="flex-1 flex flex-col">
          
          {/* TOP NAVBAR (Gives smooth desktop integration and dynamic time/flag indicators) */}
          <header className="bg-[#111827]/95 border-b border-[#374151]/70 sticky top-0 z-30 px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md shadow-lg">
            
            {/* Branding Logo & Back to Gateway */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-3">
                <button 
                  onClick={enterGateway}
                  className="p-1.5 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
                  title="Back to Gateway"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    F.L.O.W.S.
                    <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full animate-ping"></span>
                  </h1>
                  <p className="text-[10px] text-[#9CA3AF] font-bold">Barangay Rizal Rainfall Monitor</p>
                </div>
              </div>

              {/* Status Pill on mobile */}
              <div className="flex md:hidden items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1F2937] border border-[#374151] text-[9px] font-bold text-[#60A5FA]">
                <span className="w-1 h-1 bg-[#60A5FA] rounded-full animate-pulse" />
                <span>LIVE FEED</span>
              </div>
            </div>

            {/* DESKTOP INTEGRATED NAVIGATION TABS (Resolves Buggy bottom navbar on web layout) */}
            <nav className="hidden md:flex items-center gap-2 bg-[#1F2937]/50 border border-[#374151]/50 p-1 rounded-xl">
              <button
                onClick={() => changeTab('weather')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${
                  activeTab === 'weather' ? 'bg-[#111827] text-[#60A5FA]' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Weather
              </button>
              <button
                onClick={() => changeTab('zones')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${
                  activeTab === 'zones' ? 'bg-[#111827] text-[#60A5FA]' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Zones Overview
              </button>
              <button
                onClick={() => changeTab('alerts')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${
                  activeTab === 'alerts' ? 'bg-[#111827] text-[#60A5FA]' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Alert Warnings
              </button>
              <Link
                href="/emergency"
                className="px-4 py-2 text-xs font-black uppercase rounded-lg text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
              >
                Emergency Hub
              </Link>
            </nav>

            {/* Live Date, Time & PST 🇵🇭 Badge (Fully Responsive) */}
            <div className="flex items-center gap-2.5 bg-[#1F2937]/55 border border-[#374151]/60 px-3 py-1.5 rounded-xl shadow-inner w-full sm:w-auto justify-center sm:justify-end">
              <span className="text-sm select-none">🇵🇭</span>
              <div className="text-left leading-none space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black font-mono tracking-tight text-white select-none">{phTime || '10:27:00 PM'}</span>
                  <span className="text-[8px] font-black text-[#60A5FA] tracking-wider uppercase bg-[#60A5FA]/10 px-1 rounded select-none">PST</span>
                </div>
                <div className="text-[9px] text-[#9CA3AF] font-bold tracking-wide select-none">{phDate || 'Thursday, May 21, 2026'}</div>
              </div>
            </div>

          </header>

          {/* MAIN WEB DASHBOARD GRID */}
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6 z-10 pb-24 md:pb-12">
            
            {/* Header section with zone selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#60A5FA] uppercase tracking-wider block">Observer Dashboard</span>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Barangay Rizal Rainfall Observatory
                </h2>
              </div>

              {/* Responsive Zone Selector Dropdown */}
              <div className="relative w-full md:w-72">
                <label className="block text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
                  Active Monitoring Zone
                </label>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1F2937] border border-[#374151] rounded-xl text-left shadow-lg focus:outline-none hover:bg-[#253245] transition-colors"
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
                        {Object.values(ZONES_DATABASE).map((zone) => (
                          <button
                            key={zone.id}
                            onClick={() => {
                              setSelectedZone(zone.id);
                              setShowDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#374151]/50 text-left transition-colors ${
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
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* TAB VIEW MODE RESOLUTION */}
            
            {/* ========================================================
                TAB 1: WEATHER OBSERVED PANEL (Bento Grid)
                ======================================================== */}
            {activeTab === 'weather' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
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

                  <div className="mt-6 pt-4 border-t border-[#374151]/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: getAlertColor(activeZoneData.alertLevel) }} />
                      <span className="font-extrabold text-[12px]" style={{ color: getAlertColor(activeZoneData.alertLevel) }}>
                        {activeZoneData.alertText}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] font-bold">Synchronized 1m ago</span>
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
                      <p className="text-xs font-bold text-white leading-relaxed">
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
              <div className="space-y-4">
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
                  {Object.values(ZONES_DATABASE).map((zone) => (
                    <div 
                      key={zone.id}
                      className="bg-[#1F2937] border border-[#374151] hover:border-[#60A5FA]/30 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-lg"
                    >
                      <div className="flex justify-between items-start pb-3 border-b border-[#374151]/50">
                        <div>
                          <h4 className="text-sm font-black text-white">{zone.name}</h4>
                          <span className="text-[10px] text-[#9CA3AF]">{zone.purok}</span>
                        </div>
                        <span 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getAlertColor(zone.alertLevel) }}
                        />
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
                        onClick={() => {
                          setSelectedZone(zone.id);
                          setActiveTab('weather');
                        }}
                        className="w-full py-1.5 bg-[#111827]/40 hover:bg-[#111827] text-[#60A5FA] font-bold text-[10px] uppercase rounded-xl transition-all border border-[#374151] flex items-center justify-center gap-1"
                      >
                        <span>Focus Zone Dashboard</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 3: ALERTS THRESHOLDS SUMMARY
                ======================================================== */}
            {activeTab === 'alerts' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Threshold Rules */}
                <div className="md:col-span-2 bg-[#1F2937] border border-[#374151] rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-[#374151] flex items-center gap-2">
                    <Bell size={16} className="text-[#EF4444]" />
                    F.L.O.W.S. System Warn Calibration limits
                  </h3>

                  <div className="space-y-3.5">
                    
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#EF4444]/15 flex items-center justify-center font-bold text-xs text-[#EF4444] shrink-0 border border-[#EF4444]/30">R</div>
                      <div>
                        <h4 className="text-xs font-black text-[#EF4444] uppercase">Red Threshold: Critical (&gt; 30mm/hr)</h4>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">Heavy prolonged rain. Evacuation coordinates fully armed. Proceed to Barangay Gym shelter.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#F97316]/15 flex items-center justify-center font-bold text-xs text-[#F97316] shrink-0 border border-[#F97316]/30">O</div>
                      <div>
                        <h4 className="text-xs font-black text-[#F97316] uppercase">Orange Threshold: Warning (15 - 30mm/hr)</h4>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">Extreme precipitation levels. Secure home goods. Prepare evacuation grab bags.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#F59E0B]/15 flex items-center justify-center font-bold text-xs text-[#F59E0B] shrink-0 border border-[#F59E0B]/30">Y</div>
                      <div>
                        <h4 className="text-xs font-black text-[#F59E0B] uppercase">Yellow Threshold: Monitor (7.5 - 15mm/hr)</h4>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">Heavy rains ongoing. Mudslide checks active. Gutters and drains active monitoring.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#4ADE80]/15 flex items-center justify-center font-bold text-xs text-[#4ADE80] shrink-0 border border-[#4ADE80]/30">G</div>
                      <div>
                        <h4 className="text-xs font-black text-[#4ADE80] uppercase">Green Threshold: Normal (&lt; 7.5mm/hr)</h4>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">Safe rain indices. Continuous sync verified. Standard overcast operations.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Local Broadcast Activity */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider pb-2 border-b border-[#374151]">
                    System Timeline Broadcasts
                  </h3>
                  
                  <div className="relative pl-4 border-l border-[#374151] space-y-4 ml-1">
                    
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#EF4444]" />
                      <div className="text-[10px] text-[#EF4444] font-black uppercase">Red Alert Triggered • 9:45 PM</div>
                      <p className="text-[11px] text-white font-bold leading-relaxed mt-0.5">Zone 1 Riverside sensor exceeded critical threshold.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#F97316]" />
                      <div className="text-[10px] text-[#F97316] font-black uppercase">Orange Alert Triggered • 9:15 PM</div>
                      <p className="text-[11px] text-white font-bold leading-relaxed mt-0.5">Zone 3 precipitation hit 22.1 mm.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#4ADE80]" />
                      <div className="text-[10px] text-[#4ADE80] font-black uppercase">Telemetry Sync OK • 8:00 PM</div>
                      <p className="text-[11px] text-[#9CA3AF] leading-relaxed mt-0.5">All 5 sensor nodes synchronized successfully.</p>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </main>

          {/* DOCK-STABLE BOTTOM NAVIGATION BAR ON MOBILE DEVICES (Hidden on Desktop) */}
          <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
            <nav className="bg-[#1F2937]/90 border border-[#374151]/80 rounded-2xl flex justify-around items-center px-2 py-2 backdrop-blur-lg shadow-2xl">
              
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
                <span className="text-[9px] font-bold mt-1 tracking-wide">Alerts</span>
              </button>

              <Link 
                href="/emergency"
                className="flex flex-col items-center justify-center py-1 flex-1 text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
              >
                <ShieldAlert size={18} />
                <span className="text-[9px] font-bold mt-1 tracking-wide">Emergency</span>
              </Link>

            </nav>
          </div>

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
