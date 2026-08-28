import React, { useState } from 'react';
import { CryptoAsset, Timeframe } from '../types';
import { formatCurrency, formatCompactNumber, formatPercent, getHeatmapTileColor } from '../utils/formatters';
import { LayoutGrid, Layers, Clock, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface PerformanceHeatmapProps {
  top10Assets: CryptoAsset[];
  broadAssets: CryptoAsset[];
  onSelectAsset: (asset: CryptoAsset) => void;
}

export const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({
  top10Assets,
  broadAssets,
  onSelectAsset,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('24h');
  const [viewScope, setViewScope] = useState<'top10' | 'top30'>('top10');
  const [sizeBy, setSizeBy] = useState<'volume' | 'mcap'>('volume');

  const assetsToDisplay = viewScope === 'top10' ? top10Assets : broadAssets.slice(0, 30);

  const timeframes: { id: Timeframe; label: string }[] = [
    { id: '24h', label: '24H' },
    { id: '1w', label: '1W (7d)' },
    { id: '1m', label: '1M (30d)' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '12M (1Y)' },
  ];

  // Calculate stats for current timeframe
  const returns = assetsToDisplay.map(a => a.returns[selectedTimeframe] || 0);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / (returns.length || 1);
  const winnersCount = returns.filter(r => r > 0).length;
  const losersCount = returns.filter(r => r < 0).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20">
      
      {/* Heatmap Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span>Performance Heatmap</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
              Multi-Timeframe
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Instantly identify relative winners & losers sized by {sizeBy === 'volume' ? '24h Volume' : 'Market Cap'}
          </p>
        </div>

        {/* Control Button Groups */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Timeframe Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                id={`heatmap-timeframe-${tf.id}`}
                onClick={() => setSelectedTimeframe(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeframe === tf.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Scope Toggle: Top 10 vs Top 30 */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewScope('top10')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewScope === 'top10'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 10 Leaders
            </button>
            <button
              onClick={() => setViewScope('top30')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewScope === 'top30'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 30 Market
            </button>
          </div>

        </div>
      </div>

      {/* Heatmap Meta Bar (Breadth summary for current selected timeframe) */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs border-b border-slate-800/60 font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Avg {selectedTimeframe.toUpperCase()} Return:</span>
            <span className={`font-bold ${avgReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatPercent(avgReturn)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">{winnersCount} Advancing</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 font-semibold">{losersCount} Declining</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] font-sans">
          <span className="text-slate-500 mr-1">Scale:</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">&lt;-15%</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-800/80 text-rose-100">-5%</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">0%</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-100">+5%</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">&gt;+15%</span>
        </div>
      </div>

      {/* Interactive Tile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-4">
        {assetsToDisplay.map((asset) => {
          const ret = asset.returns[selectedTimeframe] ?? 0;
          const { bg, text, border } = getHeatmapTileColor(ret);
          const isTop3 = asset.volumeRank <= 3;

          return (
            <div
              key={asset.id}
              id={`heatmap-tile-${asset.symbol.toLowerCase()}`}
              onClick={() => onSelectAsset(asset)}
              className={`${bg} ${border} border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg active:scale-98 group min-h-[115px]`}
            >
              {/* Header inside tile */}
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-black text-sm tracking-tight ${text}`}>
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono px-1 rounded bg-black/20">
                      #{asset.volumeRank}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-80 truncate max-w-[110px] font-sans">
                    {asset.name}
                  </div>
                </div>

                <span className="text-[11px] font-mono font-medium opacity-90">
                  {formatCurrency(asset.priceUsd)}
                </span>
              </div>

              {/* Center return percentage */}
              <div className="my-1.5">
                <div className={`text-xl font-extrabold tracking-tight ${text} flex items-center gap-1`}>
                  {ret >= 0 ? (
                    <TrendingUp className="w-4 h-4 inline-block opacity-80" />
                  ) : (
                    <TrendingDown className="w-4 h-4 inline-block opacity-80" />
                  )}
                  <span>{formatPercent(ret)}</span>
                </div>
                <div className="text-[10px] opacity-75 font-sans">
                  {selectedTimeframe.toUpperCase()} return
                </div>
              </div>

              {/* Bottom footer inside tile */}
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono opacity-85">
                <span>Vol: {formatCompactNumber(asset.volume24hUsd)}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
