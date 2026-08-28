/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { MarketDashboardData, CryptoAsset } from './types';
import { Header } from './components/Header';
import { MarketPulseBanner } from './components/MarketPulseBanner';
import { VolumeMatrixTable } from './components/VolumeMatrixTable';
import { PerformanceHeatmap } from './components/PerformanceHeatmap';
import { MarketBreadthView } from './components/MarketBreadthView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { SnapshotExportModal } from './components/SnapshotExportModal';
import { Table, LayoutGrid, Scale, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<MarketDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'volume' | 'heatmap' | 'breadth'>('volume');
  const [visitorCountry, setVisitorCountry] = useState<{ country: string; countryCode: string; flag?: string } | null>(null);

  const fetchMarketData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch('/api/market-summary');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load market summary`);
      }
      const json: MarketDashboardData = await res.json();
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
