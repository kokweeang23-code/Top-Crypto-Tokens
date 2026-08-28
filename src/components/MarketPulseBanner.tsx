import React from 'react';
import { MarketPulse } from '../types';
import { formatCompactNumber, formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, Gauge, Flame, PieChart, ShieldAlert, Sparkles, BarChart2 } from 'lucide-react';

interface MarketPulseBannerProps {
  pulse: MarketPulse;
}

export const MarketPulseBanner: React.FC<MarketPulseBannerProps> = ({ pulse }) => {
  const isBullish = pulse.sentiment.includes('Bullish');
  const isBearish = pulse.sentiment.includes('Bearish');

  const sentimentColor = isBullish
    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
    : isBearish
    ? 'text-rose-400 bg-rose-950/80 border-rose-800/60'
    : 'text-amber-400 bg-amber-950/80 border-amber-800/60';

  const scoreColor = isBullish
    ? 'text-emerald-400'
    : isBearish
    ? 'text-rose-400'
    : 'text-amber-400';

  const totalEvaluated = pulse.advancingCount + pulse.decliningCount + pulse.unchangedCount || 1;
  const advancePercent = Math.round((pulse.advancingCount / totalEvaluated) * 100);
  const declinePercent = Math.round((pulse.decliningCount / totalEvaluated) * 100);
  const unchangedPercent = 100 - advancePercent - declinePercent;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20 relative overflow-hidden">
      {/* Subtle background glow based on sentiment */}
      <div
        className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15 ${
          isBullish ? 'bg-emerald-500' : isBearish ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Health Score Dial & 30-Second Diagnosis */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-5 lg:pb-0 lg:pr-6">
          
          {/* Health Gauge Box */}
          <div className="flex flex-col items-center justify-center p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 w-full sm:w-36 flex-shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Health Score</span>
            </div>
            <div className={`text-4xl font-black tracking-tight ${scoreColor}`}>
              {pulse.healthScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </div>
            <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sentimentColor}`}>
              {pulse.sentiment}
            </span>
          </div>

          {/* 30-Second Executive Summary */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Market Health in 30 Seconds</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {pulse.summary30s}
            </p>
            
            {/* Quick Gainer / Laggard Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-slate-800/60 text-xs">
              {pulse.topGainer24h && (
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-slate-500">Leader:</span>
                  <span className="font-semibold text-slate-200">{pulse.topGainer24h.symbol}</span>
                  <span className="text-emerald-400 font-medium">+{pulse.topGainer24h.change.toFixed(1)}%</span>
                </div>
              )}
              {pulse.topLaggard24h && (
                <div className="flex items-center gap-1 text-slate-400 pl-2 border-l border-slate-800">
                  <span className="text-slate-500">Laggard:</span>
                  <span className="font-semibold text-slate-200">{pulse.topLaggard24h.symbol}</span>
                  <span className="text-rose-400 font-medium">{pulse.topLaggard24h.change.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Macro Breadth & Vital Stats Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Stat 1: Market Breadth */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium">Market Breadth</span>
              <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white">{advancePercent}%</span>
                <span className="text-[11px] text-emerald-400">Advancing</span>
              </div>
              
              {/* Advance/Decline Visual Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex mt-2">
                <div style={{ width: `${advancePercent}%` }} className="bg-emerald-500 h-full" title={`Advancing: ${pulse.advancingCount}`} />
                <div style={{ width: `${unchangedPercent}%` }} className="bg-slate-600 h-full" title={`Unchanged: ${pulse.unchangedCount}`} />
                <div style={{ width: `${declinePercent}%` }} className="bg-rose-500 h-full" title={`Declining: ${pulse.decliningCount}`} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>{pulse.advancingCount} Up</span>
                <span>{pulse.decliningCount} Down</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Total 24h Non-Stable Volume */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium">Total 24h Volume</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white">
                {formatCompactNumber(pulse.totalVolume24hUsd)}
              </div>
              <div className="flex items-center gap-1 text-[11px] mt-0.5 text-slate-400">
                <span>Top 10 holds</span>
                <span className="font-semibold text-cyan-400">{pulse.top10VolumeSharePercent}%</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Total Crypto Market Cap */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium">Total Market Cap</span>
              <PieChart className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white">
                {formatCompactNumber(pulse.totalMarketCapUsd)}
              </div>
              <div className="flex items-center gap-1 text-[11px] mt-0.5">
                {pulse.marketCapChange24h >= 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +{pulse.marketCapChange24h.toFixed(2)}% (24h)
                  </span>
                ) : (
                  <span className="text-rose-400 font-medium flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {pulse.marketCapChange24h.toFixed(2)}% (24h)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stat 4: BTC & ETH Dominance */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium">Dominance</span>
              <span className="text-[10px] text-slate-500 font-mono">BTC / ETH</span>
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">
                {pulse.btcDominance.toFixed(1)}% <span className="text-xs font-normal text-slate-400">/ {pulse.ethDominance.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex mt-2">
                <div style={{ width: `${pulse.btcDominance}%` }} className="bg-amber-500 h-full" title={`BTC: ${pulse.btcDominance}%`} />
                <div style={{ width: `${pulse.ethDominance}%` }} className="bg-blue-500 h-full" title={`ETH: ${pulse.ethDominance}%`} />
                <div style={{ width: `${100 - pulse.btcDominance - pulse.ethDominance}%` }} className="bg-indigo-500 h-full" title="Altcoins" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>Bitcoin</span>
                <span>Alts</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
