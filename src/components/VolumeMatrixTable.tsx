import React, { useState } from 'react';
import { CryptoAsset, Timeframe } from '../types';
import { formatCurrency, formatCompactNumber, formatPercent, getReturnColorClass, getReturnBgClass } from '../utils/formatters';
import { ArrowUpDown, ChevronRight, TrendingUp, TrendingDown, Layers, HelpCircle } from 'lucide-react';

interface VolumeMatrixTableProps {
  assets: CryptoAsset[];
  totalVolume24h: number;
  onSelectAsset: (asset: CryptoAsset) => void;
}

export const VolumeMatrixTable: React.FC<VolumeMatrixTableProps> = ({
  assets,
  totalVolume24h,
  onSelectAsset,
}) => {
  const [sortField, setSortField] = useState<'volume' | 'price' | 'mcap' | '24h' | '1w' | '1m' | '6m' | '1y'>('volume');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    switch (sortField) {
      case 'volume':
        valA = a.volume24hUsd;
        valB = b.volume24hUsd;
        break;
      case 'price':
        valA = a.priceUsd;
        valB = b.priceUsd;
        break;
      case 'mcap':
        valA = a.marketCapUsd;
        valB = b.marketCapUsd;
        break;
      case '24h':
        valA = a.returns['24h'];
        valB = b.returns['24h'];
        break;
      case '1w':
        valA = a.returns['1w'];
        valB = b.returns['1w'];
        break;
      case '1m':
        valA = a.returns['1m'];
        valB = b.returns['1m'];
        break;
      case '6m':
        valA = a.returns['6m'];
        valB = b.returns['6m'];
        break;
      case '1y':
        valA = a.returns['1y'];
        valB = b.returns['1y'];
        break;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  const maxVolume = Math.max(...assets.map(a => a.volume24hUsd), 1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Top 10 Non-Stablecoins by 24h Volume
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              Primary Liquidity Pools
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strictly excludes pegged stablecoins (USDT, USDC, DAI, etc.) • Click any asset for deep profile
          </p>
        </div>
        
        <div className="text-xs text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80 self-start sm:self-auto">
          <span>Total Pool Volume: </span>
          <span className="text-white font-bold">{formatCompactNumber(assets.reduce((sum, a) => sum + a.volume24hUsd, 0))}</span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4">Asset</th>
              <th
                onClick={() => handleSort('price')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volume')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>24h Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('mcap')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right hidden md:table-cell"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>Market Cap</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('24h')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>24H</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('1w')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>1W (7d)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('1m')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right hidden sm:table-cell"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>1M (30d)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('6m')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right hidden lg:table-cell"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>6M</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('1y')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right hidden lg:table-cell"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>12M (1Y)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-3 text-right hidden xl:table-cell">24h Trend</th>
              <th className="py-3.5 px-3 text-center w-10"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-mono">
            {sortedAssets.map((asset) => {
              const volBarPercent = Math.max(8, Math.round((asset.volume24hUsd / maxVolume) * 100));
              const is24hUp = asset.returns['24h'] >= 0;

              return (
                <tr
                  key={asset.id}
                  id={`asset-row-${asset.symbol.toLowerCase()}`}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Rank / Volume Rank Badge */}
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-800/80 text-xs font-bold text-slate-300 border border-slate-700/60 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-colors">
                      {asset.volumeRank}
                    </span>
                  </td>

                  {/* Asset Name & Symbol */}
                  <td className="py-3.5 px-4 font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-white group-hover:border-cyan-400/50 transition-colors flex-shrink-0">
                        {asset.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                            {asset.symbol}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">
                            {asset.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Mcap Rank #{asset.rank}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(asset.priceUsd)}
                    </span>
                  </td>

                  {/* 24h Volume + Visual Bar */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-cyan-300">
                        {formatCompactNumber(asset.volume24hUsd)}
                      </span>
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          style={{ width: `${volBarPercent}%` }}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {((asset.volume24hUsd / totalVolume24h) * 100).toFixed(1)}% of total
                      </span>
                    </div>
                  </td>

                  {/* Market Cap */}
                  <td className="py-3.5 px-4 text-right hidden md:table-cell">
                    <div className="text-sm font-medium text-slate-200">
                      {formatCompactNumber(asset.marketCapUsd)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Vol/Cap: {(asset.volumeToMarketCapRatio * 100).toFixed(1)}%
                    </div>
                  </td>

                  {/* 24h Return */}
                  <td className="py-3.5 px-3 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getReturnBgClass(asset.returns['24h'])}`}>
                      {formatPercent(asset.returns['24h'])}
                    </span>
                  </td>

                  {/* 1W Return */}
                  <td className="py-3.5 px-3 text-right">
                    <span className={`text-xs font-semibold ${getReturnColorClass(asset.returns['1w'])}`}>
                      {formatPercent(asset.returns['1w'])}
                    </span>
                  </td>

                  {/* 1M Return */}
                  <td className="py-3.5 px-3 text-right hidden sm:table-cell">
                    <span className={`text-xs font-semibold ${getReturnColorClass(asset.returns['1m'])}`}>
                      {formatPercent(asset.returns['1m'])}
                    </span>
                  </td>

                  {/* 6M Return */}
                  <td className="py-3.5 px-3 text-right hidden lg:table-cell">
                    <span className={`text-xs font-semibold ${getReturnColorClass(asset.returns['6m'])}`}>
                      {formatPercent(asset.returns['6m'])}
                    </span>
                  </td>

                  {/* 12M (1Y) Return */}
                  <td className="py-3.5 px-3 text-right hidden lg:table-cell">
                    <span className={`text-xs font-semibold ${getReturnColorClass(asset.returns['1y'])}`}>
                      {formatPercent(asset.returns['1y'])}
                    </span>
                  </td>

                  {/* 24h Sparkline Indicator */}
                  <td className="py-3.5 px-3 text-right hidden xl:table-cell">
                    {asset.sparkline24h && (
                      <div className="inline-flex items-center justify-end w-20 h-6">
                        <svg className="w-20 h-6 overflow-visible" viewBox="0 0 80 24">
                          <polyline
                            fill="none"
                            stroke={is24hUp ? '#10B981' : '#EF4444'}
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={asset.sparkline24h
                              .map((p, idx) => {
                                const min = Math.min(...asset.sparkline24h!);
                                const max = Math.max(...asset.sparkline24h!);
                                const range = max - min || 1;
                                const x = (idx / (asset.sparkline24h!.length - 1)) * 76 + 2;
                                const y = 20 - ((p - min) / range) * 16;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        </svg>
                      </div>
                    )}
                  </td>

                  {/* Detail Action Arrow */}
                  <td className="py-3.5 px-3 text-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <ChevronRight className="w-4 h-4 inline-block" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Note */}
      <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/60 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time volume ranking updated automatically via CoinPaprika ingestion engine.</span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Showing 10 of 10 Volume Leaders
        </div>
      </div>

    </div>
  );
};
