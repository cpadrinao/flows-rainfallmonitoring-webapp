'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Volume2, 
  ChevronRight, 
  Home, 
  Bell, 
  CloudRain,
  Compass,
  FileText,
  LifeBuoy,
  Users,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock
} from 'lucide-react';

export default function EmergencyPage() {
  const [theme] = useState<'dark'>('dark');
  const [activeCenter, setActiveCenter] = useState('center-1');
  
  // Date & Time states in Philippine Time
  const [phTime, setPhTime] = useState<string>('');
  const [phDate, setPhDate] = useState<string>('');
  const [countdownTime, setCountdownTime] = useState<string>('');

  // Load and apply theme from local storage
  useEffect(() => {
    // Light mode feature completely removed. Focus only on dark mode.
  }, []);

  // Apply theme to html element so CSS selectors [data-theme="light"] work globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  return (
    <div data-theme={theme} className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between relative overflow-x-hidden transition-colors duration-500">
      
      {/* Background Ambient Red Glow for Emergency Context */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#EF4444] blur-[160px] opacity-10 pointer-events-none left-1/2 -translate-x-1/2 -top-[100px]" />

      {/* TOP NAVBAR (Gives smooth desktop integration and dynamic time/flag indicators) */}
      <header className="bg-[#111827]/95 border-b border-[#374151]/70 sticky top-0 z-30 px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 backdrop-blur-md shadow-lg transition-all duration-300">
        
        {/* Branding Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F2937] border border-[#374151] p-0.5 overflow-hidden flex items-center justify-center shrink-0">
              <img src="/flowsnoname.png" alt="FLOWS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                EMERGENCY HUB
                <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full animate-ping"></span>
              </h1>
              <p className="text-[8px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">Barangay Rizal Rescue Portal</p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link 
              href="/?view=gateway"
              className="p-1.5 bg-[#1F2937] border border-[#374151] rounded-lg text-[#9CA3AF] hover:text-white flex items-center justify-center cursor-pointer"
              title="Back to Landing Page"
            >
              <Home size={13} />
            </Link>
          </div>
        </div>

        {/* DESKTOP INTEGRATED NAVIGATION TABS */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#1F2937]/50 border border-[#374151]/50 p-1 rounded-xl">
          <Link
            href="/?view=dashboard&tab=weather"
            className="px-3 py-1.5 text-xs font-black uppercase rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
          >
            Weather Dashboard
          </Link>
          <Link
            href="/?view=dashboard&tab=zones"
            className="px-3 py-1.5 text-xs font-black uppercase rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
          >
            Zones Overview
          </Link>
          <Link
            href="/?view=dashboard&tab=alerts"
            className="px-3 py-1.5 text-xs font-black uppercase rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
          >
            Alert Warnings
          </Link>
          <div
            className="px-3 py-1.5 text-xs font-black uppercase rounded-lg bg-[#111827] text-[#EF4444] border border-[#EF4444]/20 cursor-default"
          >
            Emergency Hub
          </div>
        </nav>

        {/* Live Right-side controls (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          
          {/* Countdown Card (API Next Forecast) */}
          <div className="flex items-center gap-2 bg-[#1F2937]/55 border border-[#374151]/60 px-3 py-1.5 rounded-xl shadow-inner select-none shrink-0">
            <Clock size={14} className="text-[#EF4444] animate-pulse" />
            <div className="text-left leading-none">
              <span className="text-[8px] font-black text-[#EF4444] tracking-wider uppercase block mb-0.5">API NEXT FORECAST</span>
              <span className="text-xs font-black font-mono tracking-tight text-white">{countdownTime || '00:59:59'}</span>
            </div>
          </div>

          {/* Date & Time Card with Aligned Philippine Flag */}
          <div className="flex items-center gap-2.5 bg-[#1F2937]/55 border border-[#374151]/60 px-3 py-1.5 rounded-xl shadow-inner select-none shrink-0 justify-center">
            <div className="text-left leading-none space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black font-mono tracking-tight text-white">{phTime || '10:27:00 PM'}</span>
                <span className="text-[8px] font-black text-[#EF4444] tracking-wider uppercase bg-[#EF4444]/10 px-1.5 py-0.5 rounded flex items-center gap-1 select-none">
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
          <Link 
            href="/?view=gateway"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#60A5FA]/40 rounded-xl text-xs font-black text-[#F9FAFB] hover:text-white transition-all shadow-md group shrink-0 cursor-pointer"
            title="Back to Landing Page"
          >
            <span>Back to Landing</span>
          </Link>

        </div>

        {/* Mobile Header Row for Time & Countdown */}
        <div className="flex sm:hidden items-center justify-between w-full gap-2 border-t border-[#374151]/30 pt-2 select-none">
          {/* Countdown Card */}
          <div className="flex items-center gap-1.5 bg-[#1F2937]/55 border border-[#374151]/60 px-2.5 py-1 rounded-lg shadow-inner flex-1 justify-center">
            <Clock size={11} className="text-[#EF4444]" />
            <div className="text-left leading-none">
              <span className="text-[7px] font-black text-[#EF4444] tracking-wider uppercase block">NEXT FORECAST</span>
              <span className="text-[10px] font-bold font-mono tracking-tight text-white">{countdownTime || '00:59:59'}</span>
            </div>
          </div>
          {/* Date & Time Card */}
          <div className="flex items-center gap-1.5 bg-[#1F2937]/55 border border-[#374151]/60 px-2.5 py-1 rounded-lg shadow-inner flex-1 justify-center">
            <div className="text-center leading-none">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-bold font-mono tracking-tight text-white">{phTime ? phTime.replace(/:\d+\s/, ' ') : '10:27 PM'}</span>
                <span className="text-[7px] font-black text-[#EF4444] tracking-wider uppercase bg-[#EF4444]/10 px-1 rounded flex items-center gap-0.5">
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 z-10 space-y-6 pb-24 md:pb-12">
        
        {/* Title description */}
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-[#EF4444] animate-pulse" />
            Rizal Rescue & Disaster Services
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Official emergency hotlines, safety instructions, and active shelter details for residents.
          </p>
        </div>

        {/* GRID LAYOUT: Perfectly balanced 3-column setup on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          
          {/* COLUMN 1: Designated Evacuation Shelters */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
              Barangay Designated Shelters
            </h3>
            
            {/* Center 1 */}
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
                    <h4 className="text-xs font-black text-white">Barangay Rizal Multipurpose Gym</h4>
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

            {/* Center 2 */}
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
                    <h4 className="text-xs font-black text-white">Rizal Elementary School Annex</h4>
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

          {/* COLUMN 2: Clickable Quick-Dial Hotlines */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
              Clickable Telephone Links
            </h3>
            
            <div className="flex flex-col gap-3">
              {/* Hot Card 1 */}
              <a 
                href="tel:5557492"
                className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#60A5FA]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">Barangay Rescue</h4>
                    <span className="text-[10px] text-[#9CA3AF]">Command Headquarters</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#60A5FA] font-mono bg-[#60A5FA]/10 py-1 px-2.5 rounded-lg">555-7492</span>
              </a>

              {/* Hot Card 2 */}
              <a 
                href="tel:0498291111"
                className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#EF4444]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">MDRRMO HQ</h4>
                    <span className="text-[10px] text-[#9CA3AF]">Disaster Response HQ</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#EF4444] font-mono bg-[#EF4444]/10 py-1 px-2.5 rounded-lg">(049) 829-1111</span>
              </a>

              {/* Hot Card 3 */}
              <a 
                href="tel:5557654"
                className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#A78BFA]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">Rizal Police Desk</h4>
                    <span className="text-[10px] text-[#9CA3AF]">Police Sub-station</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#A78BFA] font-mono bg-[#A78BFA]/10 py-1 px-2.5 rounded-lg">555-7654</span>
              </a>

              {/* Hot Card 4 */}
              <a 
                href="tel:5553473"
                className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#F97316]/40 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316] border border-[#374151]/50 group-hover:scale-105 transition-transform">
                    <Flame size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">Rizal BFP Fire Desk</h4>
                    <span className="text-[10px] text-[#9CA3AF]">Fire Emergencies</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#F97316] font-mono bg-[#F97316]/10 py-1 px-2.5 rounded-lg">555-3473</span>
              </a>
            </div>
          </div>

          {/* COLUMN 3: Evacuation Reminders and checklists */}
          <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 space-y-4 shadow-xl h-fit">
            <h3 className="text-xs font-black uppercase text-white tracking-wider pb-2 border-b border-[#374151] flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-[#F59E0B] animate-pulse" />
              Evacuation Reminders
            </h3>

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

      </main>

      {/* DOCK-STABLE BOTTOM NAVIGATION BAR ON MOBILE DEVICES */}
      <div className="flows-fixed-nav pb-[env(safe-area-inset-bottom)]">
        <nav className="bg-[#1F2937]/90 border border-[#374151]/80 rounded-2xl flex justify-around items-center px-2 py-2 backdrop-blur-lg shadow-2xl">
          
          <Link 
            href="/?view=dashboard&tab=weather"
            className="flex flex-col items-center justify-center py-1 flex-1 text-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <CloudRain size={18} />
            <span className="text-[9px] font-bold mt-1 tracking-wide">Weather</span>
          </Link>

          <Link 
            href="/?view=dashboard&tab=zones"
            className="flex flex-col items-center justify-center py-1 flex-1 text-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <MapPin size={18} />
            <span className="text-[9px] font-bold mt-1 tracking-wide">Zones</span>
          </Link>

          <Link 
            href="/?view=dashboard&tab=alerts"
            className="flex flex-col items-center justify-center py-1 flex-1 text-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <Bell size={18} />
            <span className="text-[9px] font-bold mt-1 tracking-wide">Alerts</span>
          </Link>

          <div 
            className="flex flex-col items-center justify-center py-1 flex-1 text-[#EF4444] font-black cursor-default text-center"
          >
            <ShieldAlert size={18} className="animate-pulse mx-auto" />
            <span className="text-[9px] font-bold mt-1 tracking-wide">Emergency</span>
          </div>

        </nav>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#111827] border-t border-[#374151] py-4 text-center mt-auto z-10 hidden sm:block">
        <p className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">
          © 2026 F.L.O.W.S. • TELEMETRY HUB • BARANGAY RIZAL LOCAL WARNING AGENCY
        </p>
      </footer>

    </div>
  );
}
