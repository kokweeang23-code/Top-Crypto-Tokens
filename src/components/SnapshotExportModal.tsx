import React, { useState } from 'react';
import { MarketPulse, CryptoAsset } from '../types';
import { formatCurrency, formatCompactNumber, formatPercent } from '../utils/formatters';
import { X, Copy, Check, Share2, Sparkles, Activity } from 'lucide-react';

interface SnapshotExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pulse: MarketPulse;
  top10Assets: CryptoAsset[];
  timestamp: string;
}

export const SnapshotExportModal: React.FC<SnapshotExportModalProps> = ({
  isOpen,
  onClose,
  pulse,
  top10Assets,
  timestamp,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dateStr = new Date(timestamp || Date.now()).toUTCString();

  const generateMarkdownSummary = () => {
    let md = `📊 **CryptoPulse Market Health Snapshot** (${dateStr})\n`;
    md += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    md += `🩺 **Health Score:** ${pulse.healthScore}/100 [${pulse.sentiment}]\n`;
    md += `📈 **Market Breadth:** ${pulse.advancingCount} Advancing / ${pulse.decliningCount} Declining (${pulse.advanceDeclineRatio}:1 Ratio)\n`;
    md += `💰 **Total 24h Vol:** ${formatCompactNumber(pulse.totalVolume24hUsd)} | **Total Cap:** ${formatCompactNumber(pulse.totalMarketCapUsd)}\n`;
    md += `🪙 **BTC Dom:** ${pulse.btcDominance.toFixed(1)}% | **ETH Dom:** ${pulse.ethDominance.toFixed(1)}%\n\n`;
    md += `⚡ **30-Second Diagnosis:**\n${pulse.summary30s}\n\n`;
    md += `🏆 **Top 10 Volume Leaders (Non-Stablecoins):**\n`;
    top10Assets.forEach((a, i) => {
      md += `${i + 1}. **${a.symbol}**: ${formatCurrency(a.priceUsd)} (24h: ${formatPercent(a.returns['24h'])}, 7d: ${formatPercent(a.returns['1w'])}) | Vol: ${formatCompactNumber(a.volume24hUsd)}\n`;
    });
    md += `\n🔗 *Generated via CryptoPulse • Powered by CoinPaprika Ingestion*`;
    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Shareable Market Snapshot</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot Visual Preview Card */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          <div
            id="market-snapshot-card"
            className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner space-y-4 text-xs font-sans"
          >
            {/* Snapshot Card Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-white tracking-tight">CryptoPulse Market Pulse</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  Snapshot
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{dateStr}</span>
            </div>

            {/* Health & Diagnosis */}
            <div className="flex items-start gap-4 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
              <div className="text-center px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Health</span>
                <span className="text-2xl font-black text-cyan-400">{pulse.healthScore}</span>
                <span className="text-[10px] text-emerald-400 block font-medium">{pulse.sentiment}</span>
              </div>
              <div className="flex-1">
                <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                  30-Second Diagnosis
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">{pulse.summary30s}</p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Breadth</span>
                <span className="text-white font-bold">{pulse.advanceDeclineRatio}:1 Ratio</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">24h Total Vol</span>
                <span className="text-cyan-300 font-bold">{formatCompactNumber(pulse.totalVolume24hUsd)}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">BTC Dominance</span>
                <span className="text-amber-400 font-bold">{pulse.btcDominance.toFixed(1)}%</span>
              </div>
            </div>

            {/* Top 10 Summary List */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Top 10 Volume Leaders (Non-Stablecoins)
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {top10Assets.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800/50 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-bold">{i + 1}.</span>
                      <span className="font-bold text-white">{a.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{formatCurrency(a.priceUsd)}</span>
                      <span className={a.returns['24h'] >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatPercent(a.returns['24h'])}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code & Mobile Share Section */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
              <div className="space-y-1 text-xs">
                <span className="text-slate-300 font-semibold block">Scan for Live Mobile View</span>
                <p className="text-slate-400 text-[11px] leading-snug">
                  Scan this QR code with your mobile camera to view live non-stablecoin volume rankings and diagnosis.
                </p>
                <div className="pt-1 text-[10px] font-mono text-cyan-400">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://cryptopulse.app'}
                </div>
              </div>
              <div className="bg-white p-1.5 rounded-lg flex-shrink-0 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.href : 'https://cryptopulse.app'
                  )}`}
                  alt="QR Code for Crypto Pulse"
                  className="w-20 h-20"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Formatted for sharing on Discord, Telegram, or X / Twitter.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snapshot Text</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
