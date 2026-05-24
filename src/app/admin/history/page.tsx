'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  History, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Radio,
  Search,
  Clock,
  Home,
  FileDown,
  Eye,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchSystemHealth, fetchWeatherLogs, fetchWeatherSummary, SystemHealth } from '../../lib/api';

// HistoryItem interface matches our mapped telemetry structure

interface HistoryItem {
  id: string;
  zoneName: string;
  datetime: string;
  amount: number;
  status: 'PASSED' | 'FLAGGED' | 'CORRECTED';
  notes: string;
}

export default function RainfallHistory() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoneNames, setZoneNames] = useState<Record<string, string>>({});
  const [selectedLog, setSelectedLog] = useState<HistoryItem | null>(null);
  
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
  
  // Filtering & Pagination state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Authentication check
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('flows_admin_logged_in');
    if (isLoggedIn !== 'true') {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Load dynamic telemetry and health logs from FastAPI Supabase layer
  useEffect(() => {
    if (!authorized) return;
    
    let active = true;

    const loadData = async () => {
      try {
        // 1. Fetch system health
        const healthData = await fetchSystemHealth();
        if (!active) return;
        setHealth(healthData);

        // 2. Fetch active zones summary to build ID -> Name dictionary
        const summary = await fetchWeatherSummary();
        if (!active) return;
        const mapping: Record<string, string> = {};
        Object.entries(summary).forEach(([uuid, data]) => {
          mapping[uuid] = `${data.name} (${data.purok})`;
        });
        setZoneNames(mapping);

        // 3. Fetch weather logs
        const logsData = await fetchWeatherLogs(100);
        if (!active) return;

        // Sort weather logs: latest forecast_time first, then latest fetched_at first
        const sortedLogs = [...logsData].sort((a, b) => {
          const timeA = a.forecast_time ? new Date(a.forecast_time).getTime() : 0;
          const timeB = b.forecast_time ? new Date(b.forecast_time).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          
          const fetchA = a.fetched_at ? new Date(a.fetched_at).getTime() : 0;
          const fetchB = b.fetched_at ? new Date(b.fetched_at).getTime() : 0;
          if (fetchB !== fetchA) return fetchB - fetchA;
          
          return (a.zone_id || '').localeCompare(b.zone_id || '');
        });

        const mapped: HistoryItem[] = sortedLogs.map((log, idx) => {
          const idStr = log.id ? log.id.slice(0, 8).toUpperCase() : `LOG-${idx + 1}`;
          const zoneName = mapping[log.zone_id] || log.zone_id || 'Unknown Zone';
          
          let formattedTime = 'N/A';
          if (log.forecast_time) {
            try {
              const date = new Date(log.forecast_time);
              formattedTime = date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(',', '');
            } catch {
              formattedTime = log.forecast_time;
            }
          }
          
          const amount = log.precipitation_mm ?? 0.0;
          const status = (log.validation_status || 'PASSED') as 'PASSED' | 'FLAGGED' | 'CORRECTED';
          
          // Formulate premium forecast telemetry sub-notes from database
          const notes = `Forecast: Temp: ${log.temperature_c ?? 27.5}°C | Rain Prob: ${log.precipitation_prob ?? 0}% | Humidity: ${log.relative_humidity ?? 0}% | Wind: ${log.wind_speed_kmh ?? 0} km/h | Clouds: ${log.cloud_cover_pct ?? 0}%`;

          return {
            id: idStr,
            zoneName,
            datetime: formattedTime,
            amount,
            status,
            notes
          };
        });

        setHistory(mapped);
        setIsLoading(false);
      } catch (err) {
        console.error('[RainfallHistory] Error synchronizing telemetry stream:', err);
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 20 * 1000); // refresh history every 20s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [authorized]);

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('FLOWS Rainfall History Logs', 14, 22);
    
    // Add subtitle/date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare table data
    const tableColumn = ["Log ID", "Zone Territory", "Date & Time", "Rainfall (mm)", "Notes"];
    const tableRows = filteredHistory.map(log => [
      log.id,
      log.zoneName,
      log.datetime,
      log.amount.toString(),
      log.notes
    ]);

    // Generate table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Save PDF
    doc.save('FLOWS_Rainfall_Logs.pdf');
  };

  // Filter history logs based on search query
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate pagination bounds
  const totalItems = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Adjust current page if filters shrink logs size
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  if (!authorized || isLoading || !health || health.status === 'offline' || health.open_meteo?.status === 'unreachable') {
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
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#4ADE80] blur-[150px] opacity-5 pointer-events-none -translate-y-20 left-10" />

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
                TELEMETRY HISTORY
                <span className="text-[9px] bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Admin</span>
              </h1>
              <p className="text-[8px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">Chronological audit ledger for rain observations</p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link 
              href="/admin/dashboard"
              className="p-1.5 bg-[#1F2937] border border-[#374151] rounded-lg text-[#9CA3AF] hover:text-white flex items-center justify-center cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft size={13} />
            </Link>
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
        <div className="flex md:hidden items-center justify-between w-full gap-2 border-t border-[#374151]/30 pt-2 select-none">
          {/* Countdown Card */}
          <div className="flex items-center gap-1.5 bg-[#1F2937]/55 border border-[#374151]/60 px-2.5 py-1.5 rounded-lg shadow-inner flex-1 justify-center h-[36px] min-w-0 mobile-header-card">
            <Clock size={11} className="text-[#60A5FA] shrink-0" />
            <div className="text-left leading-none min-w-0">
              <span className="text-[7px] font-black text-[#60A5FA] tracking-wider uppercase block">NEXT FORECAST</span>
              <span className="text-[10px] font-bold font-mono tracking-tight text-white block mt-0.5">{countdownTime || '00:59:59'}</span>
            </div>
          </div>
          {/* Date & Time Card */}
          <div className="flex items-center gap-1.5 bg-[#1F2937]/55 border border-[#374151]/60 px-2.5 py-1.5 rounded-lg shadow-inner flex-1 justify-center h-[36px] min-w-0 mobile-header-card">
            <Radio size={11} className="text-[#60A5FA] animate-pulse shrink-0" />
            <div className="text-left leading-none min-w-0">
              <span className="text-[7px] font-black text-[#60A5FA] tracking-wider uppercase block">PH TIME</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold font-mono tracking-tight text-white block truncate">
                  {phTime ? phTime.replace(/:\d+\s/, ' ') : '10:27 PM'}
                </span>
                <span className="text-[6px] font-black text-[#60A5FA] bg-[#60A5FA]/10 px-0.5 rounded inline-flex items-center shrink-0">
                  PH
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
          <span className="text-white font-semibold">Rainfall History</span>
        </div>

        {/* SEARCH AND FILTERS TOOLBAR */}
        <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
          
          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-3 text-[#9CA3AF]">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search by zone or notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-[#374151] focus:border-[#60A5FA] rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-[#4B5563] focus:outline-none transition-colors"
            />
          </div>

          {/* Export Action */}
          <div className="flex w-full md:w-auto items-center gap-3 justify-end">
            <button
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 hover:border-[#10B981]/50 text-[#10B981] rounded-xl p-2.5 px-5 transition-all duration-300 font-bold text-xs cursor-pointer shadow-md group shrink-0"
              title="Export as PDF"
            >
              <FileDown size={14} className="transform group-hover:translate-y-0.5 transition-transform" />
              <span>Export logs to PDF</span>
            </button>
          </div>

        </div>

        {/* TABLE SURFACE */}
        <div className="bg-[#1F2937] border border-[#374151] rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-[#9CA3AF] space-y-4">
                <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#60A5FA]/40 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider animate-pulse">Syncing chronological database logs...</p>
              </div>
            ) : paginatedLogs.length === 0 ? (
              <div className="p-8 text-center text-[#9CA3AF] space-y-2">
                <AlertTriangle size={28} className="mx-auto text-[#F59E0B]" />
                <p className="text-xs font-bold uppercase">No Telemetry Logs Matched Search Bounds</p>
                <p className="text-[11px]">Adjust your search query or validation filters.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                
                {/* Table Head */}
                <thead>
                  <tr className="border-b border-[#374151] bg-[#111827]/40 text-[#9CA3AF] font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-4 pl-6">Log ID</th>
                    <th className="p-4">Zone Territory</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Rainfall (mm)</th>
                    <th className="p-4">Log Notes</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-[#374151]/50">
                  {paginatedLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-[#111827]/20 transition-colors"
                    >
                      {/* ID */}
                      <td className="p-4 pl-6 font-mono font-bold text-[#9CA3AF]">{log.id}</td>

                      {/* Zone Name */}
                      <td className="p-4 font-extrabold text-white text-[13px]">{log.zoneName}</td>

                      {/* Datetime */}
                      <td className="p-4 text-[#9CA3AF] font-mono">{log.datetime}</td>

                      {/* Rainfall Amount */}
                      <td className="p-4 font-mono font-black text-white">{log.amount} mm</td>

                      {/* Notes */}
                      <td className="p-4 text-[#9CA3AF] italic max-w-xs truncate" title={log.notes}>
                        {log.notes}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#60A5FA]/10 hover:bg-[#60A5FA]/20 border border-[#60A5FA]/30 hover:border-[#60A5FA] rounded-xl text-[#60A5FA] transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer"
                          title="View Full Telemetry Details"
                        >
                          <Eye size={12} />
                          <span>View Details</span>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>

          {/* PAGINATION PANEL */}
          <div className="bg-[#111827]/40 border-t border-[#374151] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <div className="text-[#9CA3AF] font-bold">
              Showing <span className="text-white font-black">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="text-white font-black">{Math.min(totalItems, startIndex + itemsPerPage)}</span> of <span className="text-white font-black">{totalItems}</span> logs
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              
              {/* Prev Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 bg-[#1F2937] hover:bg-[#374151] disabled:bg-[#1F2937]/30 border border-[#374151] disabled:border-[#374151]/30 rounded-xl text-white disabled:text-[#4B5563] transition-colors flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-4 py-1.5 bg-[#1F2937]/80 border border-[#374151] rounded-xl font-bold font-mono text-white">
                Page {currentPage} of {totalPages}
              </span>

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 bg-[#1F2937] hover:bg-[#374151] disabled:bg-[#1F2937]/30 border border-[#374151] disabled:border-[#374151]/30 rounded-xl text-white disabled:text-[#4B5563] transition-colors flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>

            </div>
          </div>

        </div>

      </main>

      {/* FULL TELEMETRY DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          
          {/* Modal Card */}
          <div className="bg-[#1F2937] border border-[#374151] w-full max-w-lg rounded-3xl shadow-2xl p-6 relative z-10 weather-glow-blue">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#374151] mb-5">
              <div className="flex items-center gap-2">
                <History className="text-[#60A5FA] shrink-0" size={18} />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Full Telemetry Log Record
                  </h3>
                  <p className="text-[10px] text-[#9CA3AF] font-mono uppercase tracking-wider">
                    LOG ID: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 bg-[#111827] border border-[#374151] rounded-xl text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs">
              
              {/* Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Zone Territory */}
                <div className="bg-[#111827] border border-[#374151]/55 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider block">Zone Territory</span>
                  <span className="font-extrabold text-white text-[13px]">{selectedLog.zoneName}</span>
                </div>

                {/* Datetime (Forecast Time) */}
                <div className="bg-[#111827] border border-[#374151]/55 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider block">Forecast Time &amp; Date</span>
                  <span className="font-mono text-white tracking-wide text-xs block">{selectedLog.datetime}</span>
                </div>

                {/* Rainfall Amount */}
                <div className="bg-[#111827] border border-[#374151]/55 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider block">Precipitation Amount</span>
                  <span className="font-black text-white text-base font-mono block">{selectedLog.amount.toFixed(2)} mm</span>
                </div>

              </div>

              {/* Detailed Atmospheric Specs Card */}
              <div className="bg-[#111827] border border-[#374151]/55 rounded-2xl p-4 space-y-3">
                <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider block border-b border-[#374151]/60 pb-1.5">
                  Detailed Forecast Metrics
                </span>
                
                <div className="grid grid-cols-3 gap-3 text-[11px]">
                  
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#9CA3AF] uppercase font-bold block">Temperature</span>
                    <span className="text-white font-black font-mono">
                      {selectedLog.notes.match(/Temp:\s*([-\d.]+)/)?.[1] || '27.5'}°C
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#9CA3AF] uppercase font-bold block">Precip Prob</span>
                    <span className="text-white font-black font-mono">
                      {selectedLog.notes.match(/Rain Prob:\s*(\d+)/)?.[1] || '0'}%
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#9CA3AF] uppercase font-bold block">Humidity</span>
                    <span className="text-white font-black font-mono">
                      {selectedLog.notes.match(/Humidity:\s*(\d+)/)?.[1] || '0'}%
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#9CA3AF] uppercase font-bold block">Wind Speed</span>
                    <span className="text-white font-black font-mono">
                      {selectedLog.notes.match(/Wind:\s*(\d+)/)?.[1] || '0'} km/h
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#9CA3AF] uppercase font-bold block">Cloud Cover</span>
                    <span className="text-white font-black font-mono">
                      {selectedLog.notes.match(/Clouds:\s*(\d+)/)?.[1] || '0'}%
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#9CA3AF] uppercase font-bold block">Visibility</span>
                    <span className="text-white font-black font-mono">10,000 m</span>
                  </div>

                </div>
              </div>

              {/* Log Notes Detail */}
              <div className="bg-[#111827]/40 border border-[#374151]/40 rounded-2xl p-4 space-y-1.5">
                <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider block">Raw Telemetry String</span>
                <p className="text-[#9CA3AF] font-mono text-[10px] leading-relaxed select-all selection:bg-[#60A5FA]/30 select-text">
                  {selectedLog.notes}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-[#374151] flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-[#60A5FA] hover:bg-[#60A5FA]/90 text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
              >
                Close Records View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#111827] border-t border-[#374151] py-4 text-center mt-12">
        <p className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">
          © 2026 F.L.O.W.S. AUDIT CONSOLE • RECENT PRECIPITATION HISTORICAL LOGS
        </p>
      </footer>

    </div>
  );
}
