'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js captured boundary error:', error);
  }, [error]);

  return (
    <div className="bg-[#0b0f19] min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 text-white font-sans">
      {/* Background glow effects */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#EF4444] blur-[150px] opacity-5 pointer-events-none" />
      
      {/* Main card */}
      <div className="w-full max-w-md bg-[#1F2937]/90 border border-red-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative z-10 text-center space-y-6 weather-glow-red">
        
        {/* Dynamic Warning Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#EF4444]/30 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute w-12 h-12 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 animate-pulse" />
          <div className="relative text-[#EF4444] animate-bounce" style={{ animationDuration: '3s' }}>
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* Header Branding */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5 leading-none">
            F.L.O.W.S.
            <span className="text-[10px] bg-[#EF4444]/20 text-[#EF4444] px-2 py-0.5 rounded font-black tracking-widest uppercase">System</span>
          </h1>
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
            Barangay Rizal Rainfall Monitoring Telemetry
          </p>
        </div>

        {/* Maintenance Message */}
        <div className="bg-[#111827]/40 border border-[#374151]/30 rounded-2xl p-5 text-center space-y-2.5">
          <h2 className="text-base font-black text-white uppercase tracking-wider">System Under Maintenance</h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            The F.L.O.W.S. backend telemetry database is currently unreachable. Our rescue operators and engineers are actively calibrating the sensor stream endpoints. Please try again in a few moments.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={() => reset()}
            className="flex-1 py-3 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/10 cursor-pointer"
          >
            <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span>Retry Connection</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="flex-1 py-3 bg-[#1E2229] hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home size={13} />
            <span>Go to Landing</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-[8px] font-mono text-[#9CA3AF] pt-2 border-t border-[#374151]/40">
          ERROR_CODE: TELEMETRY_STREAM_OFFLINE
        </div>

      </div>
    </div>
  );
}
