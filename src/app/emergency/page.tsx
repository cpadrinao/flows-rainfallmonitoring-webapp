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
  Calendar,
  Clock
} from 'lucide-react';

export default function EmergencyPage() {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [activeCenter, setActiveCenter] = useState('center-1');
  
  // Date & Time states in Philippine Time
  const [phTime, setPhTime] = useState<string>('');
  const [phDate, setPhDate] = useState<string>('');

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

  const toggleSiren = () => {
    setSirenPlaying(!sirenPlaying);
  };

  return (
    <div className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Background Ambient Red Glow for Emergency Context */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#EF4444] blur-[160px] opacity-10 pointer-events-none left-1/2 -translate-x-1/2 -top-[100px]" />

      {/* TOP NAVBAR (Same responsive style as main dashboard) */}
      <header className="bg-[#111827]/95 border-b border-[#374151]/70 sticky top-0 z-30 px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md shadow-lg">
        
        {/* Branding & Back to Gateway */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <Link 
              href="/?view=gateway" 
              className="p-1.5 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
              title="Back to Gateway"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                EMERGENCY HUB
                <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full animate-ping"></span>
              </h1>
              <p className="text-[10px] text-[#EF4444] font-bold tracking-wider uppercase">Barangay Rizal Portal</p>
            </div>
          </div>

          <Link href="/admin/login" className="text-[9px] font-black text-[#9CA3AF] hover:text-[#60A5FA] bg-[#1F2937] px-2.5 py-1.5 rounded-lg border border-[#374151] transition-colors md:hidden">
            ADMIN PORTAL
          </Link>
        </div>

        {/* DESKTOP INTEGRATED NAVIGATION TABS */}
        <nav className="hidden md:flex items-center gap-2 bg-[#1F2937]/50 border border-[#374151]/50 p-1 rounded-xl">
          <Link
            href="/?view=dashboard&tab=weather"
            className="px-4 py-2 text-xs font-black uppercase rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
          >
            Weather Dashboard
          </Link>
          <Link
            href="/?view=dashboard&tab=zones"
            className="px-4 py-2 text-xs font-black uppercase rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
          >
            Zones Overview
          </Link>
          <Link
            href="/?view=dashboard&tab=alerts"
            className="px-4 py-2 text-xs font-black uppercase rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
          >
            Alert Warnings
          </Link>
          <div
            className="px-4 py-2 text-xs font-black uppercase rounded-lg bg-[#111827] text-[#EF4444] border border-[#EF4444]/20 cursor-default"
          >
            Emergency Hub
          </div>
        </nav>

        {/* Live Date, Time & PST 🇵🇭 Badge (Fully Responsive) */}
        <div className="flex items-center gap-2.5 bg-[#1F2937]/55 border border-[#374151]/60 px-3 py-1.5 rounded-xl shadow-inner w-full md:w-auto justify-center md:justify-end">
          <span className="text-sm select-none">🇵🇭</span>
          <div className="text-left leading-none space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black font-mono tracking-tight text-white select-none">{phTime || '10:27:00 PM'}</span>
              <span className="text-[8px] font-black text-[#EF4444] tracking-wider uppercase bg-[#EF4444]/10 px-1 rounded select-none">PST</span>
            </div>
            <div className="text-[9px] text-[#9CA3AF] font-bold tracking-wide select-none">{phDate || 'Thursday, May 21, 2026'}</div>
          </div>
        </div>

        <Link href="/admin/login" className="hidden md:inline-flex text-xs font-black text-[#9CA3AF] hover:text-[#60A5FA] bg-[#1F2937] px-3 py-1.5 rounded-xl border border-[#374151] transition-colors">
          Admin Portal
        </Link>

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
            Instant telemetric alarm overrides, official hotlines, emergency instructions, and active shelter details.
          </p>
        </div>

        {/* GRID LAYOUT: Web responsive double columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT SECTION (Col Span 2 on Desktop): Sirens & Hotlines */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Warning Siren Simulator (Wow Factor) */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 ${
              sirenPlaying 
                ? 'bg-[#EF4444]/20 border-[#EF4444] weather-glow-red animate-pulse' 
                : 'bg-[#1F2937] border-[#374151]'
            }`}>
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mx-auto sm:mx-0 ${
                  sirenPlaying ? 'bg-[#EF4444] text-white animate-spin' : 'bg-[#EF4444]/15 text-[#EF4444]'
                }`}>
                  <Volume2 size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">
                    Simulate Warning Siren
                  </h3>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 leading-snug">
                    {sirenPlaying ? 'Broadcasting active emergency beacon to all nodes.' : 'Trigger warning siren mock broadcast.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleSiren}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${
                  sirenPlaying ? 'bg-[#111827] text-[#EF4444]' : 'bg-[#EF4444] text-white hover:bg-[#EF4444]/80 shadow-lg shadow-red-900/20'
                }`}
              >
                {sirenPlaying ? 'Silence Alarm' : 'Broadcast Siren'}
              </button>
            </div>

            {/* Clickable Quick-Dial Hotlines */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
                Clickable Telephone Links
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Hot Card 1 */}
                <a 
                  href="tel:5557492"
                  className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#60A5FA]/40 p-4 rounded-2xl flex items-center justify-between transition-all group"
                  onClick={(e) => {
                    // Simulated visual dialer trigger
                    console.log("Dialing...");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA] border border-[#374151]/50">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white leading-tight">Barangay Rescue</h4>
                      <span className="text-[10px] text-[#9CA3AF]">Command Headquarters</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#60A5FA] font-mono bg-[#60A5FA]/10 py-1 px-2.5 rounded-lg block">555-7492</span>
                  </div>
                </a>

                {/* Hot Card 2 */}
                <a 
                  href="tel:0498291111"
                  className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#EF4444]/40 p-4 rounded-2xl flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] border border-[#374151]/50">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white leading-tight">MDRRMO HQ</h4>
                      <span className="text-[10px] text-[#9CA3AF]">Disaster Response HQ</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#EF4444] font-mono bg-[#EF4444]/10 py-1 px-2.5 rounded-lg block">(049) 829-1111</span>
                  </div>
                </a>

                {/* Hot Card 3 */}
                <a 
                  href="tel:5557654"
                  className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] p-4 rounded-2xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] border border-[#374151]/50">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white leading-tight">Rizal Police Desk</h4>
                      <span className="text-[10px] text-[#9CA3AF]">Police Sub-station</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#A78BFA] font-mono bg-[#A78BFA]/10 py-1 px-2.5 rounded-lg block">555-7654</span>
                  </div>
                </a>

                {/* Hot Card 4 */}
                <a 
                  href="tel:5553473"
                  className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] p-4 rounded-2xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316] border border-[#374151]/50">
                      <Flame size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white leading-tight">Rizal BFP Fire Desk</h4>
                      <span className="text-[10px] text-[#9CA3AF]">Fire Emergencies</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#F97316] font-mono bg-[#F97316]/10 py-1 px-2.5 rounded-lg block">555-3473</span>
                  </div>
                </a>

              </div>
            </div>

          </div>

          {/* RIGHT SECTION (Col Span 1): Reminders & Centers */}
          <div className="space-y-6">
            
            {/* Evacuation Reminders & Checklists */}
            <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black uppercase text-white tracking-wider pb-2 border-b border-[#374151] flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-[#F59E0B] animate-pulse" />
                Evacuation Reminders
              </h3>

              <div className="space-y-3.5 text-xs leading-relaxed">
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

            {/* Evacuation Centers Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-[#9CA3AF] tracking-wider ml-1">
                Barangay Designated Shelters
              </h3>

              {/* Center 1 */}
              <div 
                onClick={() => setActiveCenter('center-1')}
                className={`bg-[#1F2937] border p-4 rounded-2xl cursor-pointer transition-all ${
                  activeCenter === 'center-1' ? 'border-[#60A5FA] weather-glow-blue' : 'border-[#374151]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-2.5">
                    <MapPin size={16} className="text-[#60A5FA] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-white">Barangay Rizal Multipurpose Gym</h4>
                      <p className="text-[9px] text-[#9CA3AF] mt-0.5">High School Complex (Elevated Ground)</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-[#4ADE80] bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#374151]/50 flex justify-between items-center text-[9px] text-[#9CA3AF]">
                  <span>Capacity Filled: <strong className="text-white">42% (210 / 500)</strong></span>
                  <div className="w-20 bg-[#111827] rounded-full h-1 overflow-hidden">
                    <div className="bg-[#F59E0B] h-full" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>

              {/* Center 2 */}
              <div 
                onClick={() => setActiveCenter('center-2')}
                className={`bg-[#1F2937] border p-4 rounded-2xl cursor-pointer transition-all ${
                  activeCenter === 'center-2' ? 'border-[#60A5FA] weather-glow-blue' : 'border-[#374151]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-2.5">
                    <MapPin size={16} className="text-[#A78BFA] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-white">Rizal Elementary School Annex</h4>
                      <p className="text-[9px] text-[#9CA3AF] mt-0.5">Central Plaza Grounds (Elevated Annex)</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-[#4ADE80] bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#374151]/50 flex justify-between items-center text-[9px] text-[#9CA3AF]">
                  <span>Capacity Filled: <strong className="text-white">15% (45 / 300)</strong></span>
                  <div className="w-20 bg-[#111827] rounded-full h-1 overflow-hidden">
                    <div className="bg-[#4ADE80] h-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* DOCK-STABLE BOTTOM NAVIGATION BAR ON MOBILE DEVICES */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
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
