import React from 'react';
import { CryptoAsset } from '../types';
import { formatCurrency, formatCompactNumber, formatPercent, getReturnColorClass, getReturnBgClass } from '../utils/formatters';
import { X, ExternalLink, ShieldCheck, Zap, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface AssetDetailModalProps {
  asset: CryptoAsset | null;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  const returns = [
    { label: '24 Hours', value: asset.returns['24h'], code: '24H' },
    { label: '1 Week (7d)', value: asset.returns['1w'], code: '1W' },
    { label: '1 Month (30d)', value: asset.returns['1m'], code: '1M' },
    { label: '6 Months', value: asset.returns['6m'], code: '6M' },
    { label: '12 Months (1Y)', value: asset.returns['1y'], code: '1Y' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div
        id={`asset-detail-modal-${asset.symbol.toLowerCase()}`}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200 animate-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
              {asset.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{asset.name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {asset.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-cyan-400 font-medium font-mono">Vol Rank #{asset.volumeRank}</span>
                <span>•</span>
                <span className="font-mono">Mcap Rank #{asset.rank}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Main Price & Volume Hero */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Live Price (USD)</span>
              <span className="text-2xl font-bold font-mono text-white">
                {formatCurrency(asset.priceUsd)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">24h Trading Volume</span>
              <span className="text-xl font-bold font-mono text-cyan-300">
                {formatCompactNumber(asset.volume24hUsd)}
              </span>
            </div>
          </div>

          {/* Historical Returns Breakdown Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Historical Returns Multi-Timeframe</span>
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {returns.map((r) => (
                <div
                  key={r.code}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-center flex flex-col justify-between"
                >
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1 font-mono">
                    {r.code}
                  </span>
                  <span className={`text-xs font-bold font-mono ${getReturnColorClass(r.value)}`}>
                    {formatPercent(r.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Fundamental Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Market Capitalization</span>
              <span className="font-bold text-white font-mono">{formatCompactNumber(asset.marketCapUsd)}</span>
            </div>
            
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Volume / Market Cap</span>
              <span className="font-bold text-cyan-300 font-mono">{(asset.volumeToMarketCapRatio * 100).toFixed(2)}%</span>
            </div>

            {asset.athPriceUsd && (
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">All-Time High (ATH)</span>
                <span className="font-bold text-slate-200 font-mono">{formatCurrency(asset.athPriceUsd)}</span>
              </div>
            )}

            {asset.athPercentChange !== undefined && (
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Distance from ATH</span>
                <span className="font-bold text-rose-400 font-mono">{asset.athPercentChange.toFixed(1)}%</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <a
            href={`https://coinpaprika.com/coin/${asset.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            <span>View on CoinPaprika</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
