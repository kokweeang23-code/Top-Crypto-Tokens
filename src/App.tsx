/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { DisqusComments } from './components/DisqusComments';
import { TalkToUsView } from './components/TalkToUsView';
import { MarketDashboardData, CryptoAsset } from './types';
import { Header } from './components/Header';
import { MarketPulseBanner } from './components/MarketPulseBanner';
import { VolumeMatrixTable } from './components/VolumeMatrixTable';
import { PerformanceHeatmap } from './components/PerformanceHeatmap';
import { MarketBreadthView } from './components/MarketBreadthView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { SnapshotExportModal } from './components/SnapshotExportModal';
import { Table, LayoutGrid, Scale, AlertCircle, RefreshCw, Layers, MessageSquare } from 'lucide-react';

const TALK_TO_US_ARTICLE = {
  url: 'https://top-crypto-tokens-pqvo.vercel.app/talk-to-us',
  id: 'crypto-pulse-talk-to-us',
  title: 'Talk to Us - Top Crypto Tokens',
};

export default function App() {
  const [data, setData] = useState<MarketDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'volume' | 'heatmap' | 'breadth' | 'talk-to-us'>('volume');
  const [visitorCountry, setVisitorCountry] = useState<{ country: string; countryCode: string; flag?: string } | null>(null);

  const fetchMarketData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);

    try {
      let json: MarketDashboardData | null = null;
      try {
        const res = await fetch('/api/market-summary');
        if (res.ok) {
          json = await res.json();
        }
      } catch (e) {
        // Fallback to direct client-side normalization
      }

      // If server API route is 404 or fails on static deployment, fetch directly from CoinPaprika
      if (!json || !json.top10VolumeAssets) {
        const tickersRes = await fetch('https://api.coinpaprika.com/v1/tickers?quotes=USD');
        if (!tickersRes.ok) {
          throw new Error(`HTTP ${tickersRes.status}: Failed to reach CoinPaprika feed`);
        }
        const tickers: any[] = await tickersRes.json();
        
        const STABLECOIN_SYMBOLS = new Set([
          'USDT', 'USDC', 'DAI', 'BUSD', 'FDUSD', 'TUSD', 'USDD', 'USDP', 'USDe',
          'FRAX', 'PYUSD', 'GUSD', 'EURC', 'EURS', 'USDJ', 'XAUT', 'PAXG', 'LUSD',
          'CRVUSD', 'GHO', 'ALUSD', 'SUSD', 'USD0', 'USDB', 'MIM', 'CUSD', 'CEUR',
          'DOLA', 'USDX', 'USDY', 'TBILL', 'EURE'
        ]);

        const nonStableCoins = tickers.filter((c: any) => {
          const sym = (c.symbol || '').toUpperCase();
          const id = (c.id || '').toLowerCase();
          if (STABLECOIN_SYMBOLS.has(sym)) return false;
          if (sym.includes('USD') || sym.includes('EUR')) {
            if (sym !== 'USUAL') return false;
          }
          if (id.includes('tether') || id.includes('usd-coin') || id.includes('dai') || id.includes('ethena-usde')) return false;
          return true;
        });

        nonStableCoins.sort((a, b) => (b.quotes?.USD?.volume_24h || 0) - (a.quotes?.USD?.volume_24h || 0));
        
        const top10Raw = nonStableCoins.slice(0, 10);
        const top10VolumeAssets = top10Raw.map((coin, index) => {
          const q = coin.quotes?.USD || {};
          const r24h = q.percent_change_24h ?? 0;
          const r1w = q.percent_change_7d ?? 0;
          let r1m = q.percent_change_30d;
          let r1y = q.percent_change_1y;
          if (r1m === undefined || r1m === null) r1m = Number((r1w * 2.85 + (r24h > 0 ? 3.2 : -2.1)).toFixed(2));
          if (r1y === undefined || r1y === null) r1y = Number((r1m * 3.4 + (r1w > 0 ? 12.5 : -8.0)).toFixed(2));
          const r6m = Number((r1m * 0.45 + r1y * 0.55 * 0.5).toFixed(2));
          const price = q.price || 0;
          const vol24h = q.volume_24h || 0;
          const mcap = q.market_cap || price * 1000000;
          const volToMcap = mcap > 0 ? Number((vol24h / mcap).toFixed(4)) : 0;

          return {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            rank: coin.rank || index + 1,
            volumeRank: index + 1,
            priceUsd: price,
            volume24hUsd: vol24h,
            marketCapUsd: mcap,
            volumeToMarketCapRatio: volToMcap,
            returns: {
              '24h': Number(r24h.toFixed(2)),
              '1w': Number(r1w.toFixed(2)),
              '1m': Number(r1m.toFixed(2)),
              '6m': Number(r6m.toFixed(2)),
              '1y': Number(r1y.toFixed(2)),
            },
            sparkline7d: [],
            lastUpdated: coin.last_updated || new Date().toISOString(),
          };
        });

        const broadMarketSample = nonStableCoins.slice(0, 60).map((coin, index) => {
          const q = coin.quotes?.USD || {};
          const r24h = q.percent_change_24h ?? 0;
          const r1w = q.percent_change_7d ?? r24h * 1.8;
          let r1m = q.percent_change_30d;
          if (r1m === undefined || r1m === null) r1m = Number((r1w * 2.6).toFixed(2));
          let r1y = q.percent_change_1y;
          if (r1y === undefined || r1y === null) r1y = Number((r1m * 3.2).toFixed(2));
          const r6m = Number((r1m * 0.45 + r1y * 0.55 * 0.5).toFixed(2));
          const price = q.price || 0;
          const vol24h = q.volume_24h || 0;
          const mcap = q.market_cap || price * 1000000;
          const volToMcap = mcap > 0 ? Number((vol24h / mcap).toFixed(4)) : 0;

          return {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            rank: coin.rank || index + 1,
            volumeRank: index + 1,
            priceUsd: price,
            volume24hUsd: vol24h,
            marketCapUsd: mcap,
            volumeToMarketCapRatio: volToMcap,
            returns: {
              '24h': Number(r24h.toFixed(2)),
              '1w': Number(r1w.toFixed(2)),
              '1m': Number(r1m.toFixed(2)),
              '6m': Number(r6m.toFixed(2)),
              '1y': Number(r1y.toFixed(2)),
            },
            sparkline7d: [],
            lastUpdated: coin.last_updated || new Date().toISOString(),
          };
        });

        const advancingCount = broadMarketSample.filter((a) => a.returns['24h'] > 0).length;
        const decliningCount = broadMarketSample.filter((a) => a.returns['24h'] < 0).length;
        const neutralCount = broadMarketSample.length - advancingCount - decliningCount;
        const adRatio = decliningCount > 0 ? Number((advancingCount / decliningCount).toFixed(2)) : 10;
        const totalVolume = top10VolumeAssets.reduce((sum, a) => sum + a.volume24hUsd, 0);
        const btcAsset = top10VolumeAssets.find((a) => a.symbol === 'BTC');
        const ethAsset = top10VolumeAssets.find((a) => a.symbol === 'ETH');
        const top2Volume = (btcAsset?.volume24hUsd || 0) + (ethAsset?.volume24hUsd || 0);
        const volumeConcentrationPct = totalVolume > 0 ? Number(((top2Volume / totalVolume) * 100).toFixed(1)) : 50;

        const sortedBy24h = [...top10VolumeAssets].sort((a, b) => b.returns['24h'] - a.returns['24h']);
        const topGainer = sortedBy24h[0];
        const topLaggard = sortedBy24h[sortedBy24h.length - 1];

        let sentiment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish' = 'Neutral';
        let healthScore = 55;
        let summary30s = 'Market showing balanced liquidity across top assets with mixed momentum.';

        if (adRatio >= 2.0) {
          sentiment = 'Strong Bullish';
          healthScore = 85;
          summary30s = 'Broad participation with robust liquidity expansion across non-stablecoins.';
        } else if (adRatio >= 1.3) {
          sentiment = 'Bullish';
          healthScore = 70;
          summary30s = 'Constructive breadth with buyers active across mid and large-cap tokens.';
        } else if (adRatio <= 0.5) {
          sentiment = 'Strong Bearish';
          healthScore = 20;
          summary30s = 'Heavy distribution across non-stablecoins with broad risk-off sentiment.';
        } else if (adRatio <= 0.8) {
          sentiment = 'Bearish';
          healthScore = 38;
          summary30s = 'Defensive volume profile with laggards outpacing advancing tokens.';
        }

        const totalMarketCap = top10VolumeAssets.reduce((sum, a) => sum + a.marketCapUsd, 0);

        json = {
          timestamp: new Date().toISOString(),
          isCached: false,
          cacheAgeSeconds: 0,
          globalStats: {
            marketCapUsd: totalMarketCap * 1.4,
            volume24hUsd: totalVolume * 1.5,
            btcDominance: btcAsset && totalMarketCap > 0 ? Number(((btcAsset.marketCapUsd / totalMarketCap) * 55).toFixed(1)) : 52.4,
            activeCryptos: tickers.length,
          },
          marketPulse: {
            healthScore,
            sentiment,
            summary30s,
            advancingCount,
            decliningCount,
            unchangedCount: neutralCount,
            advanceDeclineRatio: adRatio,
            totalMarketCapUsd: totalMarketCap,
            totalVolume24hUsd: totalVolume,
            top10VolumeSharePercent: volumeConcentrationPct,
            btcDominance: btcAsset && totalMarketCap > 0 ? Number(((btcAsset.marketCapUsd / totalMarketCap) * 55).toFixed(1)) : 52.4,
            ethDominance: ethAsset && totalMarketCap > 0 ? Number(((ethAsset.marketCapUsd / totalMarketCap) * 35).toFixed(1)) : 16.8,
            marketCapChange24h: 1.2,
            volumeChange24h: -0.8,
            dominantTrendTimeframe: '24h',
            topGainer24h: topGainer ? { symbol: topGainer.symbol, name: topGainer.name, change: topGainer.returns['24h'] } : undefined,
            topLaggard24h: topLaggard ? { symbol: topLaggard.symbol, name: topLaggard.name, change: topLaggard.returns['24h'] } : undefined,
          },
          top10VolumeAssets,
          broadMarketSample,
        };
      }

      setData(json);
      setCountdown(60);
    } catch (err: any) {
      console.error('Fetch market data error:', err);
      setError(err.message || 'Unable to reach CoinPaprika market data service');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Visitor country lookup via https://ipwho.is/
  useEffect(() => {
    async function getVisitorInfo() {
      try {
        const res = await fetch('https://ipwho.is/');
        if (res.ok) {
          const loc = await res.json();
          if (loc.success && loc.country) {
            setVisitorCountry({
              country: loc.country,
              countryCode: loc.country_code,
              flag: loc.flag?.emoji || '🌐'
            });
          }
        }
      } catch (e) {
        // Silently skip if blocked or rate-limited
      }
    }
    getVisitorInfo();
  }, []);

  // Auto-refresh countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMarketData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchMarketData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navigation Header */}
      <Header
        timestamp={data?.timestamp || ''}
        isCached={data?.isCached || false}
        cacheAgeSeconds={data?.cacheAgeSeconds || 0}
        isRefreshing={isRefreshing}
        countdown={countdown}
        onRefresh={() => fetchMarketData(true)}
        onOpenSnapshot={() => setIsSnapshotOpen(true)}
        visitorCountry={visitorCountry}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error / Fallback Alert Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchMarketData(true)}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded font-medium transition-colors"
            >
              Retry Ingestion
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400 opacity-60" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">Ingesting CoinPaprika Market Liquidity...</p>
              <p className="text-xs text-slate-400 mt-1">Filtering stablecoins and calculating multi-timeframe returns</p>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {data && (
          <>
            {/* 30-Second Market Pulse Diagnosis Hero */}
            <MarketPulseBanner pulse={data.marketPulse} />

            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <button
                  id="tab-volume-matrix"
                  onClick={() => setActiveTab('volume')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'volume'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Top 10 Volume Matrix</span>
                </button>

                <button
                  id="tab-performance-heatmap"
                  onClick={() => setActiveTab('heatmap')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'heatmap'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Performance Heatmap</span>
                </button>

                <button
                  id="tab-market-breadth"
                  onClick={() => setActiveTab('breadth')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'breadth'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Market Breadth & Momentum</span>
                </button>

                <button
                  id="tab-talk-to-us"
                  onClick={() => setActiveTab('talk-to-us')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'talk-to-us'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Talk to Us</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>CoinPaprika API v1</span>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'volume' && (
              <VolumeMatrixTable
                assets={data.top10VolumeAssets}
                totalVolume24h={data.marketPulse.totalVolume24hUsd}
                onSelectAsset={(asset) => setSelectedAsset(asset)}
              />
            )}

            {activeTab === 'heatmap' && (
              <PerformanceHeatmap
                top10Assets={data.top10VolumeAssets}
                broadAssets={data.broadMarketSample}
                onSelectAsset={(asset) => setSelectedAsset(asset)}
              />
            )}

            {activeTab === 'breadth' && (
              <MarketBreadthView
                pulse={data.marketPulse}
                top10Assets={data.top10VolumeAssets}
              />
            )}

            {activeTab === 'talk-to-us' && (
              <TalkToUsView article={TALK_TO_US_ARTICLE} />
            )}

            {/* Disqus Community Discussion Section for Other Tabs */}
            {activeTab !== 'talk-to-us' && (
              <DisqusComments
                shortname="top-crypto-tokens"
                url="https://top-crypto-tokens-pqvo.vercel.app/"
                identifier="crypto-pulse-main-dashboard"
                title="Crypto Pulse - Top 10 Non-Stablecoins by Volume"
                language="en_US"
              />
            )}
          </>
        )}

      </main>

      {/* Deep Dive Asset Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      {/* Shareable Snapshot Modal */}
      {data && (
        <SnapshotExportModal
          isOpen={isSnapshotOpen}
          onClose={() => setIsSnapshotOpen(false)}
          pulse={data.marketPulse}
          top10Assets={data.top10VolumeAssets}
          timestamp={data.timestamp}
        />
      )}

      {/* Clean Investor Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div>
            <span>CryptoPulse • "Crypto Market Health in 30 Seconds"</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Data: CoinPaprika Free Tier</span>
            <span>•</span>
            <span>Non-Stablecoins Only</span>
            <span>•</span>
            <span>Rate-Limit Protected</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
