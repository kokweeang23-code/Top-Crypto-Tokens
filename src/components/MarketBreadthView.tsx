import React from 'react';
import { MarketPulse, CryptoAsset } from '../types';
import { formatCompactNumber, formatPercent, getReturnColorClass } from '../utils/formatters';
import { BarChart3, TrendingUp, TrendingDown, Layers, Zap, Scale, Compass } from 'lucide-react';

interface MarketBreadthViewProps {
  pulse: MarketPulse;
  top10Assets: CryptoAsset[];
}

export const MarketBreadthView: React.FC<MarketBreadthViewProps> = ({
  pulse,
  top10Assets,
}) => {
  // Sort Top 10 by returns across 24h & 1w to show breadth dispersion
  const sorted24h = [...top10Assets].sort((a, b) => b.returns['24h'] - a.returns['24h']);
  const sorted1w = [...top10Assets].sort((a, b) => b.returns['1w'] - a.returns['1w']);

  const totalEvaluated = pulse.advancingCount + pulse.decliningCount + pulse.unchangedCount || 1;
  const advancePercent = ((pulse.advancingCount / totalEvaluated) * 100).toFixed(0);
  const declinePercent = ((pulse.decliningCount / totalEvaluated) * 100).toFixed(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Card: Market Breadth Analysis */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Market Breadth & Momentum
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Evaluates the net percentage of non-stablecoin crypto assets participating in the current trend.
          </p>

          {/* Advance/Decline Ratio Meter */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Advance / Decline Ratio</span>
              <span className="font-mono font-bold text-cyan-300">{pulse.advanceDeclineRatio} : 1.0</span>
            </div>
            
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div style={{ width: `${advancePercent}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${declinePercent}%` }} className="bg-rose-500 h-full" />
            </div>

            <div className="flex justify-between items-center text-xs mt-2 font-mono">
              <span className="text-emerald-400 font-semibold">{pulse.advancingCount} Advancing ({advancePercent}%)</span>
              <span className="text-rose-400 font-semibold">{pulse.decliningCount} Declining ({declinePercent}%)</span>
            </div>
          </div>

          {/* Breadth Diagnostic Checklist */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-slate-400">Breadth Quality</span>
              <span className="font-semibold text-emerald-400">
                {Number(advancePercent) >= 60 ? 'Broad Participation (Healthy)' : Number(advancePercent) <= 40 ? 'Narrow / Defensive' : 'Selective / Mixed'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-slate-400">Dominant Horizon</span>
              <span className="font-semibold text-cyan-300 uppercase font-mono">
                {pulse.dominantTrendTimeframe} Momentum
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-slate-400">Top 10 Volume Dominance</span>
              <span className="font-semibold text-white font-mono">
                {pulse.top10VolumeSharePercent}% of non-stable market
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
          Breadth prevents "fakeouts" where a single mega-cap token drives market indices higher while mid-caps bleed.
        </div>
      </div>

      {/* Center Card: 24h Relative Performance Dispersion */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              24h Volume Leaders Dispersion
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Ranked by 24h %</span>
        </div>

        <div className="space-y-2 mt-2">
          {sorted24h.map((asset) => {
            const ret = asset.returns['24h'];
            const barWidth = Math.min(Math.abs(ret) * 8, 100);

            return (
              <div key={asset.id} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-bold text-white font-mono">{asset.symbol}</span>
                <div className="flex-1 bg-slate-950 h-5 rounded-md overflow-hidden flex items-center px-2 relative border border-slate-800/60">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`absolute top-0 bottom-0 ${ret >= 0 ? 'bg-emerald-500/20 left-0' : 'bg-rose-500/20 right-0'}`}
                  />
                  <span className="text-[11px] text-slate-400 relative z-10 font-mono">
                    Vol: {formatCompactNumber(asset.volume24hUsd)}
                  </span>
                </div>
                <span className={`w-16 text-right font-mono font-semibold ${getReturnColorClass(ret)}`}>
                  {formatPercent(ret)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Card: 1-Week (7d) Momentum Leaders */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              1-Week (7d) Trend Persistence
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Ranked by 7d %</span>
        </div>

        <div className="space-y-2 mt-2">
          {sorted1w.map((asset) => {
            const ret = asset.returns['1w'];
            const barWidth = Math.min(Math.abs(ret) * 4, 100);

            return (
              <div key={asset.id} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-bold text-white font-mono">{asset.symbol}</span>
                <div className="flex-1 bg-slate-950 h-5 rounded-md overflow-hidden flex items-center px-2 relative border border-slate-800/60">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`absolute top-0 bottom-0 ${ret >= 0 ? 'bg-indigo-500/20 left-0' : 'bg-rose-500/20 right-0'}`}
                  />
                  <span className="text-[11px] text-slate-400 relative z-10 font-mono truncate">
                    {asset.name}
                  </span>
                </div>
                <span className={`w-16 text-right font-mono font-semibold ${getReturnColorClass(ret)}`}>
                  {formatPercent(ret)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
