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
  FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HistoryItem {
  id: string;
  zoneName: string;
  datetime: string;
  amount: number;
  status: 'PASSED' | 'FLAGGED' | 'CORRECTED';
  notes: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: 'log-1', zoneName: 'Zone 1 (Purok Narra)', datetime: '2026-05-21 21:30:00', amount: 32.8, status: 'PASSED', notes: 'River sensor synced' },
  { id: 'log-2', zoneName: 'Zone 3 (Sitio Pag-asa)', datetime: '2026-05-21 21:28:00', amount: 22.1, status: 'PASSED', notes: 'Street level rain gauged' },
  { id: 'log-3', zoneName: 'Zone 2 (Purok Mahogany)', datetime: '2026-05-21 21:15:00', amount: 45.2, status: 'FLAGGED', notes: 'Anomalous rain rate spike detected' },
  { id: 'log-4', zoneName: 'Zone 4 (Purok Acacia)', datetime: '2026-05-21 20:45:00', amount: 8.5, status: 'PASSED', notes: 'Slope telemetry active' },
  { id: 'log-5', zoneName: 'Zone 5 (Purok Ilang-Ilang)', datetime: '2026-05-21 20:30:00', amount: 3.2, status: 'PASSED', notes: 'Safe overcast drizzle' },
  { id: 'log-6', zoneName: 'Zone 1 (Purok Narra)', datetime: '2026-05-21 19:30:00', amount: 26.4, status: 'PASSED', notes: 'River level rising' },
  { id: 'log-7', zoneName: 'Zone 3 (Sitio Pag-asa)', datetime: '2026-05-21 19:00:00', amount: 18.6, status: 'PASSED', notes: 'High precipitation rate' },
  { id: 'log-8', zoneName: 'Zone 2 (Purok Mahogany)', datetime: '2026-05-21 18:45:00', amount: 11.2, status: 'CORRECTED', notes: 'Calibrated noise spike from sensor 2B' },
  { id: 'log-9', zoneName: 'Zone 5 (Purok Ilang-Ilang)', datetime: '2026-05-21 18:00:00', amount: 1.5, status: 'PASSED', notes: 'Normal readings' },
  { id: 'log-10', zoneName: 'Zone 4 (Purok Acacia)', datetime: '2026-05-21 17:30:00', amount: 7.2, status: 'PASSED', notes: 'Slope sensor heartbeat active' },
  { id: 'log-11', zoneName: 'Zone 1 (Purok Narra)', datetime: '2026-05-21 16:00:00', amount: 55.4, status: 'FLAGGED', notes: 'Open-Meteo precipitation spike exceeded bounds' },
  { id: 'log-12', zoneName: 'Zone 3 (Sitio Pag-asa)', datetime: '2026-05-21 15:30:00', amount: 14.2, status: 'PASSED', notes: 'Purok sync established' },
  { id: 'log-13', zoneName: 'Zone 2 (Purok Mahogany)', datetime: '2026-05-21 14:00:00', amount: 9.8, status: 'CORRECTED', notes: 'Manual operator validation sync' },
  { id: 'log-14', zoneName: 'Zone 4 (Purok Acacia)', datetime: '2026-05-21 13:30:00', amount: 6.1, status: 'PASSED', notes: 'Periodic check' },
  { id: 'log-15', zoneName: 'Zone 5 (Purok Ilang-Ilang)', datetime: '2026-05-21 12:00:00', amount: 2.1, status: 'PASSED', notes: 'Telemetry active' }
];

export default function RainfallHistory() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Authentication check & Database load
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('flows_admin_logged_in');
    if (isLoggedIn !== 'true') {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
      
      // Load from local storage or set mock database
      const stored = localStorage.getItem('flows_history_db');
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          setHistory(MOCK_HISTORY);
          localStorage.setItem('flows_history_db', JSON.stringify(MOCK_HISTORY));
        }
      } else {
        setHistory(MOCK_HISTORY);
        localStorage.setItem('flows_history_db', JSON.stringify(MOCK_HISTORY));
      }
    }
  }, [router]);

  const saveHistoryToStorage = (updatedHistory: HistoryItem[]) => {
    setHistory(updatedHistory);
    localStorage.setItem('flows_history_db', JSON.stringify(updatedHistory));
  };

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
    const tableColumn = ["Log ID", "Zone Territory", "Date & Time", "Rainfall (mm)", "Status", "Notes"];
    const tableRows = filteredHistory.map(log => [
      log.id,
      log.zoneName,
      log.datetime,
      log.amount.toString(),
      log.status,
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

  // Filter history logs based on search query & status dropdown
  const filteredHistory = history.filter(item => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch = item.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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

  const getStatusBadgeStyles = (status: 'PASSED' | 'FLAGGED' | 'CORRECTED') => {
    switch (status) {
      case 'PASSED':
        return 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30';
      case 'FLAGGED':
        return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
      case 'CORRECTED':
        return 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (!authorized) {
    return (
      <div className="bg-[#0b0f19] min-h-screen w-full flex items-center justify-center text-white">
        <span className="w-8 h-8 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin"></span>
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
              <Home size={13} />
            </Link>
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

          {/* Filters Select & Export */}
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF] font-bold whitespace-nowrap">
              <Filter size={14} className="text-[#60A5FA]" />
              <span className="hidden sm:inline">Filter Status:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40 bg-[#111827] border border-[#374151] focus:border-[#60A5FA] rounded-xl p-2 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Validations</option>
              <option value="PASSED">Passed Only</option>
              <option value="FLAGGED">Flagged Only</option>
              <option value="CORRECTED">Corrected Only</option>
            </select>

            <button
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 hover:border-[#10B981]/50 text-[#10B981] rounded-xl p-2 px-4 transition-all duration-300 font-bold text-xs"
              title="Export as PDF"
            >
              <FileDown size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

        </div>

        {/* TABLE SURFACE */}
        <div className="bg-[#1F2937] border border-[#374151] rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="overflow-x-auto">
            {paginatedLogs.length === 0 ? (
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
                    <th className="p-4">Validation Status</th>
                    <th className="p-4 pr-6">Log Notes</th>
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

                      {/* Validation Status Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusBadgeStyles(log.status)}`}>
                          {log.status === 'PASSED' && <CheckCircle2 size={10} />}
                          {log.status === 'FLAGGED' && <AlertTriangle size={10} className="animate-pulse" />}
                          {log.status === 'CORRECTED' && <RefreshCw size={10} />}
                          {log.status}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="p-4 pr-6 text-[#9CA3AF] italic max-w-xs truncate" title={log.notes}>
                        {log.notes}
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

      {/* FOOTER */}
      <footer className="bg-[#111827] border-t border-[#374151] py-4 text-center mt-12">
        <p className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">
          © 2026 F.L.O.W.S. AUDIT CONSOLE • RECENT PRECIPITATION HISTORICAL LOGS
        </p>
      </footer>

    </div>
  );
}
