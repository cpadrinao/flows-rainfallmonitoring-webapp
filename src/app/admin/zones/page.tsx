'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  X,
  Radio,
  ChevronRight,
  TrendingUp,
  Clock,
  Home
} from 'lucide-react';
import { fetchSystemHealth, SystemHealth } from '../../lib/api';

interface ZoneItem {
  id: string;
  name: string;
  purok: string;
  alertLevel: 'Red' | 'Orange' | 'Yellow' | 'Green';
  amount: number;
  status: string;
}

const DEFAULT_ZONES: ZoneItem[] = [
  { id: 'zone-1', name: 'Zone 1', purok: 'Purok Narra (Riverside Area)', alertLevel: 'Red', amount: 32.8, status: 'Heavy Rain' },
  { id: 'zone-2', name: 'Zone 2', purok: 'Purok Mahogany (Upper Ridge)', alertLevel: 'Green', amount: 12.4, status: 'Moderate Rain' },
  { id: 'zone-3', name: 'Zone 3', purok: 'Sitio Pag-asa (Lowland Plain)', alertLevel: 'Orange', amount: 22.1, status: 'Heavy Rain' },
  { id: 'zone-4', name: 'Zone 4', purok: 'Purok Acacia (Slope & Foothills)', alertLevel: 'Yellow', amount: 8.5, status: 'Light Rain' },
  { id: 'zone-5', name: 'Zone 5', purok: 'Purok Ilang-Ilang (Centro)', alertLevel: 'Green', amount: 3.2, status: 'Cloudy' },
];

export default function ZoneManagement() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  
  const [theme] = useState<'dark'>('dark');
  const [phTime, setPhTime] = useState<string>('');
  const [phDate, setPhDate] = useState<string>('');
  const [countdownTime, setCountdownTime] = useState<string>('');

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

  // Load live health status from backend
  useEffect(() => {
    let active = true;
    const loadHealth = async () => {
      try {
        const healthData = await fetchSystemHealth();
        if (!active) return;
        setHealth(healthData);
      } catch (err) {
        console.error('[ZoneManagement] Error loading live health:', err);
      }
    };
    loadHealth();
    const interval = setInterval(loadHealth, 15 * 1000); // refresh every 15s
    return () => {
      active = false;
      clearInterval(interval);
    };
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
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add Monitored Zone');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [zoneName, setZoneName] = useState('');
  const [purokDesc, setPurokDesc] = useState('');
  const [alertLevel, setAlertLevel] = useState<'Red' | 'Orange' | 'Yellow' | 'Green'>('Green');
  const [rainAmount, setRainAmount] = useState<number>(0);
  const [weatherStatus, setWeatherStatus] = useState('Clear');
  
  // Validation error
  const [validationError, setValidationError] = useState('');

  // Authentication check & database load
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('flows_admin_logged_in');
    if (isLoggedIn !== 'true') {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
      
      // Load from local storage or initialize
      const stored = localStorage.getItem('flows_zones_db');
      if (stored) {
        try {
          setZones(JSON.parse(stored));
        } catch (e) {
          setZones(DEFAULT_ZONES);
          localStorage.setItem('flows_zones_db', JSON.stringify(DEFAULT_ZONES));
        }
      } else {
        setZones(DEFAULT_ZONES);
        localStorage.setItem('flows_zones_db', JSON.stringify(DEFAULT_ZONES));
      }
    }
  }, [router]);

  const saveZonesToStorage = (updatedZones: ZoneItem[]) => {
    setZones(updatedZones);
    localStorage.setItem('flows_zones_db', JSON.stringify(updatedZones));
  };

  const openAddModal = () => {
    setModalTitle('Add Monitored Zone');
    setEditingId(null);
    setZoneName('');
    setPurokDesc('');
    setAlertLevel('Green');
    setRainAmount(0);
    setWeatherStatus('Clear');
    setValidationError('');
    setShowModal(true);
  };

  const openEditModal = (zone: ZoneItem) => {
    setModalTitle('Edit Monitored Zone');
    setEditingId(zone.id);
    setZoneName(zone.name);
    setPurokDesc(zone.purok);
    setAlertLevel(zone.alertLevel);
    setRainAmount(zone.amount);
    setWeatherStatus(zone.status);
    setValidationError('');
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // CRITICAL: Validation for empty zone name
    if (!zoneName.trim()) {
      setValidationError('Zone name is required and cannot be left empty.');
      return;
    }

    if (editingId) {
      // Edit mode: Preserve existing API telemetry metrics
      const updated = zones.map(z => {
        if (z.id === editingId) {
          return {
            ...z,
            name: zoneName.trim(),
            purok: purokDesc.trim() || 'General Territory'
          };
        }
        return z;
      });
      saveZonesToStorage(updated);
    } else {
      // Add mode: Initialize zone with Green Alert and Pending API Sync status
      const newId = `zone-${Date.now()}`;
      const newZone: ZoneItem = {
        id: newId,
        name: zoneName.trim(),
        purok: purokDesc.trim() || 'General Territory',
        alertLevel: 'Green',
        amount: 0.0,
        status: 'Pending API Sync'
      };
      saveZonesToStorage([...zones, newZone]);
    }

    setShowModal(false);
  };

  const handleRemoveZone = (id: string) => {
    if (confirm('Are you sure you want to remove this zone from the telemetry array?')) {
      const updated = zones.filter(z => z.id !== id);
      saveZonesToStorage(updated);
    }
  };

  const getAlertBadgeColor = (level: string) => {
    switch (level) {
      case 'Red': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
      case 'Orange': return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
      case 'Yellow': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
      case 'Green': return 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (!authorized || !health || health.status === 'offline' || health.open_meteo?.status === 'unreachable') {
    return (
      <div className="bg-[#0b0f19] min-h-screen w-full flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4 text-center">
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
    <div data-theme={theme} className="bg-[#0b0f19] min-h-screen w-full text-[#F9FAFB] font-sans flex flex-col justify-between relative overflow-x-hidden animate-fade-in transition-colors duration-500">
      
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#60A5FA] blur-[150px] opacity-5 pointer-events-none -translate-y-20 left-10" />

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
                ZONE MANAGEMENT
                <span className="text-[9px] bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Admin</span>
              </h1>
              <p className="text-[8px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">Define and calibrate local sensor territory scopes</p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link 
              href="/admin/dashboard"
              className="p-1.5 bg-[#1F2937] border border-[#374151] rounded-lg text-[#9CA3AF] hover:text-white flex items-center justify-center cursor-pointer"
              title="Back to Dashboard"
            >
              <Home size={13} />
            </Link>
          </div>
        </div>

        {/* Live Right-side controls (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          
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

          {/* Back to Dashboard Button positioned at the very right */}
          <Link 
            href="/admin/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#60A5FA]/40 rounded-xl text-xs font-black text-[#F9FAFB] hover:text-white transition-all shadow-md group shrink-0 cursor-pointer"
            title="Back to Dashboard"
          >
            <span>Back to Dashboard</span>
          </Link>

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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 z-10 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
          <Link href="/admin/dashboard" className="hover:text-white transition-colors">Console</Link>
          <ChevronRight size={12} />
          <span className="text-white font-semibold">Zone Control</span>
        </div>

        {/* ZONES TABLE SURFACE */}
        <div className="bg-[#1F2937] border border-[#374151] rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="p-5 border-b border-[#374151] flex justify-between items-center bg-[#1F2937]/50">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#60A5FA]" />
              <h3 className="text-sm font-black text-white">Monitored Sectors Array ({zones.length})</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={openAddModal}
                className="flex items-center gap-1.5 bg-[#60A5FA] hover:bg-[#60A5FA]/90 text-[#111827] font-black text-[11px] tracking-wider uppercase py-2 px-4 rounded-xl transition-all duration-150 shadow-md cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Zone</span>
              </button>
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#9CA3AF]">
                <Radio size={12} className="text-[#4ADE80] animate-pulse" />
                <span>ACTIVE TELEMETRY STREAM</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {zones.length === 0 ? (
              <div className="p-8 text-center text-[#9CA3AF] space-y-2">
                <AlertCircle size={28} className="mx-auto text-[#EF4444]" />
                <p className="text-xs font-bold uppercase">No Active Monitored Zones Found</p>
                <p className="text-[11px]">Click "Add Zone" in the header to initialize a telemetry profile.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                
                {/* Table Head */}
                <thead>
                  <tr className="border-b border-[#374151] bg-[#111827]/40 text-[#9CA3AF] font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-4 pl-6">Zone ID</th>
                    <th className="p-4">Area / Purok Name</th>
                    <th className="p-4">Alert Level</th>
                    <th className="p-4">Rainfall (mm)</th>
                    <th className="p-4">Status Class</th>
                    <th className="p-4 pr-6 text-right">Console Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-[#374151]/50">
                  {zones.map((zone) => (
                    <tr 
                      key={zone.id} 
                      className="hover:bg-[#111827]/20 transition-colors"
                    >
                      {/* ID */}
                      <td className="p-4 pl-6 font-mono font-bold text-[#60A5FA]">{zone.id}</td>
                      
                      {/* Name & Subtext */}
                      <td className="p-4">
                        <span className="font-extrabold text-white block text-[13px]">{zone.name}</span>
                        <span className="text-[10px] text-[#9CA3AF]">{zone.purok}</span>
                      </td>

                      {/* Alert Level Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getAlertBadgeColor(zone.alertLevel)}`}>
                          {zone.alertLevel} Alert
                        </span>
                      </td>

                      {/* Rainfall Amount */}
                      <td className="p-4 font-mono font-black text-white">{zone.amount} mm</td>

                      {/* Status */}
                      <td className="p-4 font-bold text-[#9CA3AF] uppercase tracking-wide text-[10px]">{zone.status}</td>

                      {/* Action Buttons */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(zone)}
                            className="p-1.5 bg-[#60A5FA]/10 hover:bg-[#60A5FA]/20 border border-[#60A5FA]/30 hover:border-[#60A5FA] rounded-lg text-[#60A5FA] transition-all duration-150"
                            title="Edit Zone Parameters"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleRemoveZone(zone.id)}
                            className="p-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 hover:border-[#EF4444] rounded-lg text-[#EF4444] transition-all duration-150"
                            title="Remove Zone"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>

        </div>

      </main>

      {/* FORM MODAL PANEL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          {/* Modal Container */}
          <div className="bg-[#1F2937] border border-[#374151] w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-pulse-slow">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#374151] mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <MapPin size={16} className="text-[#60A5FA]" />
                {modalTitle}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 bg-[#111827] border border-[#374151] rounded text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-3 flex items-start gap-2 text-xs text-[#EF4444] mb-4">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              {/* Field: Zone Name (VALIDATION APPLIED) */}
              <div>
                <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
                  Zone Name <span className="text-[#EF4444] font-black">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Zone 6" 
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full bg-[#111827] border border-[#374151] focus:border-[#60A5FA] rounded-xl p-2.5 text-white focus:outline-none transition-colors"
                />
              </div>

              {/* Field: Purok / Area */}
              <div>
                <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
                  Purok / Area Description
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Purok Ilang-Ilang" 
                  value={purokDesc}
                  onChange={(e) => setPurokDesc(e.target.value)}
                  className="w-full bg-[#111827] border border-[#374151] focus:border-[#60A5FA] rounded-xl p-2.5 text-white focus:outline-none transition-colors"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-[#374151]">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-[#111827] hover:bg-[#111827]/70 border border-[#374151] rounded-xl font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-[#60A5FA] hover:bg-[#60A5FA]/90 text-[#111827] font-black uppercase tracking-wider rounded-xl transition-all duration-150 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#111827] border-t border-[#374151] py-4 text-center mt-12">
        <p className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">
          © 2026 F.L.O.W.S. CONTROL CONSOLE • ZONE PARAMETER MANAGEMENT CORE
        </p>
      </footer>

    </div>
  );
}
