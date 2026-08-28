import React from 'react';
import { Activity, RefreshCw, Share2, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  timestamp: string;
  isCached: boolean;
  cacheAgeSeconds: number;
  isRefreshing: boolean;
  countdown: number;
  onRefresh: () => void;
  onOpenSnapshot: () => void;
  visitorCountry?: { country: string; countryCode: string; flag?: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  timestamp,
  isCached,
  cacheAgeSeconds,
  isRefreshing,
  countdown,
  onRefresh,
  onOpenSnapshot,
  visitorCountry,
}) => {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left Side: Big Header & Consolidated Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          {/* Logo & Big Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Crypto Pulse
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/90 text-cyan-300 border border-cyan-700/60 shadow-sm">
                  Top 10 Volume
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Non-Stablecoins Only
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Crypto Market Health in 30 Seconds • Real-time CoinPaprika Data Ingestion
              </p>
            </div>
          </div>

          {/* Consolidated Action Buttons on Left */}
          <div className="flex items-center gap-2 sm:pl-4 sm:border-l sm:border-slate-800/80 flex-shrink-0">
            {/* Refresh Button */}
            <button
              id="refresh-market-data-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 border border-slate-700/80 shadow-sm transition-all disabled:opacity-50 hover:border-slate-600"
              title="Refresh market data from CoinPaprika"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh</span>
              <span className="text-[11px] text-slate-400 font-mono">({countdown}s)</span>
            </button>

            {/* Share Snapshot */}
            <button
              id="open-snapshot-export-btn"
              onClick={onOpenSnapshot}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Snapshot</span>
            </button>
          </div>
        </div>

        {/* Right Side: Live Market Status Indicator & Visitor Region */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          {visitorCountry && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <span className="text-sm leading-none">{visitorCountry.flag || '🌐'}</span>
              <span className="text-[11px] font-mono text-slate-300">{visitorCountry.country}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Live Feed</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 text-xs">{formattedTime}</span>
              {isCached && (
                <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded font-sans">
                  {cacheAgeSeconds}s cached
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
