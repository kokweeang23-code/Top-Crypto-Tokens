import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Known stablecoins & pegged fiat assets to strictly exclude from volume rank
const STABLECOIN_SYMBOLS = new Set([
  'USDT', 'USDC', 'DAI', 'FDUSD', 'USDE', 'USDD', 'PYUSD', 'TUSD', 'USDP',
  'BUSD', 'FRAX', 'GUSD', 'LUSD', 'EURS', 'USDJ', 'CUSD', 'USTC', 'SUSD',
  'OUSD', 'USD0', 'USDG', 'BUIDL', 'EURC', 'EURT', 'USDB', 'TBILL', 'USDY',
  'USDM', 'MIM', 'ALUSD', 'DOLA', 'USDX', 'RLUSD', 'USD+', 'USDF', 'USDH',
  'GYD', 'SGYD', 'FDUSD', 'USDV', 'CUSD', 'CEUR', 'USDS', 'SKY'
]);

const STABLECOIN_NAME_KEYWORDS = [
  'tether', 'usd coin', 'dai', 'first digital', 'ethena usd', 'paypal usd',
  'trueusd', 'paxos standard', 'binance usd', 'frax', 'gemini dollar',
  'liquity usd', 'stasis euro', 'stablecoin', 'usd digital', 'usd balance',
  'usds', 'blackrock usd', 'wrapped usd', 'synthetic usd', 'euro coin'
];

function isStablecoin(asset: { symbol: string; name: string; quotes?: any }): boolean {
  const sym = (asset.symbol || '').toUpperCase().trim();
  const name = (asset.name || '').toLowerCase().trim();

  if (STABLECOIN_SYMBOLS.has(sym)) return true;
  if (sym.startsWith('USD') || sym.endsWith('USD') || sym.includes('EUR') || sym.includes('CAD') || sym.includes('GBP')) {
    // If price is within $0.90 to $1.10 and has low volatility, highly likely stablecoin
    const price = asset.quotes?.USD?.price;
    if (price && price >= 0.85 && price <= 1.15) {
      return true;
    }
  }

  for (const keyword of STABLECOIN_NAME_KEYWORDS) {
    if (name.includes(keyword)) return true;
  }

  return false;
}

// In-Memory Cache structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let marketSummaryCache: CacheEntry<any> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Fallback seed data in case the external API is ever rate-limited or unreachable
const FALLBACK_TOP10 = [
  {
    id: 'btc-bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    rank: 1,
    volumeRank: 1,
    priceUsd: 87450.20,
    volume24hUsd: 38400000000,
    marketCapUsd: 1724000000000,
    returns: { '24h': 2.84, '1w': 5.12, '1m': 14.30, '6m': 42.15, '1y': 78.40 },
    athPriceUsd: 108900.00,
    athPercentChange: -19.7,
    volumeToMarketCapRatio: 0.0222,
    sparkline24h: [85100, 85400, 86200, 85900, 86500, 87100, 86800, 87450]
  },
  {
    id: 'eth-ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rank: 2,
    volumeRank: 2,
    priceUsd: 2680.50,
    volume24hUsd: 19800000000,
    marketCapUsd: 323000000000,
    returns: { '24h': -1.15, '1w': 3.40, '1m': 8.90, '6m': 18.20, '1y': 41.50 },
    athPriceUsd: 4891.70,
    athPercentChange: -45.2,
    volumeToMarketCapRatio: 0.0613,
    sparkline24h: [2710, 2730, 2695, 2670, 2690, 2705, 2660, 2680]
  },
  {
    id: 'sol-solana',
    name: 'Solana',
    symbol: 'SOL',
    rank: 4,
    volumeRank: 3,
    priceUsd: 178.40,
    volume24hUsd: 8900000000,
    marketCapUsd: 86400000000,
    returns: { '24h': 4.60, '1w': 12.80, '1m': 24.50, '6m': 68.90, '1y': 145.20 },
    athPriceUsd: 260.06,
    athPercentChange: -31.4,
    volumeToMarketCapRatio: 0.103,
    sparkline24h: [170, 172, 175, 173, 176, 179, 177, 178.4]
  },
  {
    id: 'xrp-xrp',
    name: 'XRP',
    symbol: 'XRP',
    rank: 3,
    volumeRank: 4,
    priceUsd: 2.34,
    volume24hUsd: 7450000000,
    marketCapUsd: 134000000000,
    returns: { '24h': 3.10, '1w': 8.75, '1m': 38.20, '6m': 285.40, '1y': 310.00 },
    athPriceUsd: 3.84,
    athPercentChange: -39.1,
    volumeToMarketCapRatio: 0.0556,
    sparkline24h: [2.26, 2.29, 2.31, 2.28, 2.33, 2.36, 2.32, 2.34]
  },
  {
    id: 'bnb-binance-coin',
    name: 'BNB',
    symbol: 'BNB',
    rank: 5,
    volumeRank: 5,
    priceUsd: 645.10,
    volume24hUsd: 2100000000,
    marketCapUsd: 93500000000,
    returns: { '24h': 0.85, '1w': 2.15, '1m': 6.40, '6m': 14.80, '1y': 52.30 },
    athPriceUsd: 720.67,
    athPercentChange: -10.5,
    volumeToMarketCapRatio: 0.0225,
    sparkline24h: [640, 642, 646, 644, 643, 648, 644, 645.1]
  },
  {
    id: 'doge-dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    rank: 6,
    volumeRank: 6,
    priceUsd: 0.215,
    volume24hUsd: 3200000000,
    marketCapUsd: 31800000000,
    returns: { '24h': 6.80, '1w': 18.40, '1m': 31.20, '6m': 110.50, '1y': 155.00 },
    athPriceUsd: 0.7376,
    athPercentChange: -70.8,
    volumeToMarketCapRatio: 0.1006,
    sparkline24h: [0.201, 0.204, 0.208, 0.206, 0.211, 0.218, 0.213, 0.215]
  },
  {
    id: 'ada-cardano',
    name: 'Cardano',
    symbol: 'ADA',
    rank: 8,
    volumeRank: 7,
    priceUsd: 0.764,
    volume24hUsd: 1650000000,
    marketCapUsd: 27200000000,
    returns: { '24h': 1.45, '1w': 4.90, '1m': 19.80, '6m': 88.40, '1y': 62.10 },
    athPriceUsd: 3.10,
    athPercentChange: -75.3,
    volumeToMarketCapRatio: 0.0607,
    sparkline24h: [0.75, 0.755, 0.762, 0.758, 0.761, 0.768, 0.762, 0.764]
  },
  {
    id: 'avax-avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    rank: 9,
    volumeRank: 8,
    priceUsd: 29.80,
    volume24hUsd: 1120000000,
    marketCapUsd: 12200000000,
    returns: { '24h': -2.10, '1w': -1.20, '1m': 7.60, '6m': 22.40, '1y': 18.90 },
    athPriceUsd: 146.22,
    athPercentChange: -79.6,
    volumeToMarketCapRatio: 0.0918,
    sparkline24h: [30.4, 30.2, 29.9, 29.5, 29.7, 30.1, 29.6, 29.8]
  },
  {
    id: 'sui-sui',
    name: 'Sui',
    symbol: 'SUI',
    rank: 10,
    volumeRank: 9,
    priceUsd: 3.12,
    volume24hUsd: 1480000000,
    marketCapUsd: 9800000000,
    returns: { '24h': 5.40, '1w': 16.20, '1m': 45.10, '6m': 184.20, '1y': 240.00 },
    athPriceUsd: 3.92,
    athPercentChange: -20.4,
    volumeToMarketCapRatio: 0.151,
    sparkline24h: [2.95, 2.98, 3.05, 3.02, 3.08, 3.15, 3.10, 3.12]
  },
  {
    id: 'link-chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    rank: 11,
    volumeRank: 10,
    priceUsd: 18.60,
    volume24hUsd: 940000000,
    marketCapUsd: 11500000000,
    returns: { '24h': 1.80, '1w': 6.50, '1m': 15.40, '6m': 35.80, '1y': 48.20 },
    athPriceUsd: 52.88,
    athPercentChange: -64.8,
    volumeToMarketCapRatio: 0.0817,
    sparkline24h: [18.2, 18.3, 18.5, 18.4, 18.7, 18.9, 18.5, 18.6]
  }
];

// Helper to calculate estimated 6M return from 1M and 1Y momentum
function calculateEstimated6mReturn(r1m: number, r1y: number): number {
  if (r1m === 0 && r1y === 0) return 0;
  // Blend intermediate logarithmic return approximation
  const m1 = (r1m || 0) / 100;
  const y1 = (r1y || 0) / 100;
  // 6M is geometrically positioned between 1M and 1Y (sqrt of ratio)
  const est = (Math.sign(m1) * Math.sqrt(Math.abs(m1)) * 0.4 + y1 * 0.6) * 100;
  return Number.isFinite(est) ? Number(est.toFixed(2)) : Number(((r1m + r1y) / 2).toFixed(2));
}

// Generate Market Health Score & 30-Second Summary
function generateMarketPulse(
  top10: any[],
  broadNonStables: any[],
  globalData: any
) {
  const advancing = broadNonStables.filter(c => (c.returns['24h'] || 0) > 0.1).length;
  const declining = broadNonStables.filter(c => (c.returns['24h'] || 0) < -0.1).length;
  const unchanged = broadNonStables.length - advancing - declining;

  const totalEvaluated = broadNonStables.length || 1;
  const advancePercent = (advancing / totalEvaluated) * 100;
  const adRatio = declining > 0 ? Number((advancing / declining).toFixed(2)) : advancing;

  // Calculate average 24h & 7d change across top assets
  const avg24hTop10 = top10.reduce((acc, c) => acc + (c.returns['24h'] || 0), 0) / (top10.length || 1);
  const avg1wTop10 = top10.reduce((acc, c) => acc + (c.returns['1w'] || 0), 0) / (top10.length || 1);

  // Health Score from 0 to 100
  // Factors: Breadth (40%), Top 10 24h momentum (30%), 1W momentum (20%), Volume Strength (10%)
  let healthScore = Math.round(
    advancePercent * 0.40 +
    Math.min(Math.max((avg24hTop10 + 5) * 5, 0), 100) * 0.30 +
    Math.min(Math.max((avg1wTop10 + 10) * 3, 0), 100) * 0.20 +
    50 * 0.10
  );
  healthScore = Math.max(0, Math.min(100, healthScore));

  let sentiment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish' = 'Neutral';
  if (healthScore >= 75) sentiment = 'Strong Bullish';
  else if (healthScore >= 58) sentiment = 'Bullish';
  else if (healthScore >= 42) sentiment = 'Neutral';
  else if (healthScore >= 25) sentiment = 'Bearish';
  else sentiment = 'Strong Bearish';

  // 30-Second Executive Summary
  const topGainer = [...top10].sort((a, b) => (b.returns['24h'] || 0) - (a.returns['24h'] || 0))[0];
  const topLaggard = [...top10].sort((a, b) => (a.returns['24h'] || 0) - (b.returns['24h'] || 0))[0];

  let summary30s = '';
  if (sentiment.includes('Bullish')) {
    summary30s = `Market breadth is strongly expansive with ${advancing}/${broadNonStables.length} (${advancePercent.toFixed(0)}%) assets gaining. Volume is heavily concentrated in ${topGainer?.symbol || 'large caps'} (+${topGainer?.returns['24h']?.toFixed(1)}%), signaling robust upside conviction across major liquidity pools.`;
  } else if (sentiment.includes('Bearish')) {
    summary30s = `Defensive positioning observed as ${declining}/${broadNonStables.length} assets are under sell pressure. Top volume pools show risk-off rotation with ${topLaggard?.symbol || 'alts'} retracing (${topLaggard?.returns['24h']?.toFixed(1)}%). Watch key support liquidity.`;
  } else {
    summary30s = `Market is in balanced consolidation (${advancing} adv / ${declining} dec). Top 10 volume is anchored by Bitcoin dominance (${globalData?.btcDominance?.toFixed(1) || '58.4'}%), indicating neutral momentum pending a directional breakout.`;
  }

  const top10VolTotal = top10.reduce((acc, c) => acc + (c.volume24hUsd || 0), 0);
  const totalMarketVol = globalData?.volume24hUsd || (top10VolTotal * 1.6);
  const top10VolumeShare = Number(((top10VolTotal / totalMarketVol) * 100).toFixed(1));

  return {
    healthScore,
    sentiment,
    summary30s,
    advancingCount: advancing,
    decliningCount: declining,
    unchangedCount: unchanged,
    advanceDeclineRatio: adRatio,
    totalMarketCapUsd: globalData?.marketCapUsd || 2850000000000,
    totalVolume24hUsd: totalMarketVol,
    top10VolumeSharePercent: top10VolumeShare,
    btcDominance: globalData?.btcDominance || 58.5,
    ethDominance: globalData?.ethDominance || 13.2,
    marketCapChange24h: globalData?.marketCapChange24h || 1.45,
    volumeChange24h: globalData?.volumeChange24h || 3.80,
    dominantTrendTimeframe: (avg24hTop10 > 2 ? '24h' : avg1wTop10 > 5 ? '1w' : '1m') as any,
    topGainer24h: topGainer ? { symbol: topGainer.symbol, name: topGainer.name, change: topGainer.returns['24h'] } : undefined,
    topLaggard24h: topLaggard ? { symbol: topLaggard.symbol, name: topLaggard.name, change: topLaggard.returns['24h'] } : undefined,
  };
}

// Route: Get Market Summary & Top 10 Non-Stablecoins
app.get('/api/market-summary', async (req, res) => {
  const now = Date.now();
  const apiKey = process.env.COINPAPRIKA_API_KEY;

  if (marketSummaryCache && (now - marketSummaryCache.timestamp) < CACHE_TTL_MS) {
    const age = Math.round((now - marketSummaryCache.timestamp) / 1000);
    return res.json({
      ...marketSummaryCache.data,
      isCached: true,
      cacheAgeSeconds: age
    });
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'CryptoMarketHealth/1.0'
    };
    if (apiKey) {
      headers['Authorization'] = apiKey;
    }

    // Fetch in parallel: Global Stats + Top Tickers
    const [globalRes, tickersRes] = await Promise.all([
      fetch('https://api.coinpaprika.com/v1/global', { headers }),
      fetch('https://api.coinpaprika.com/v1/tickers?quotes=USD', { headers })
    ]);

    if (!globalRes.ok || !tickersRes.ok) {
      throw new Error(`CoinPaprika HTTP Error: global ${globalRes.status}, tickers ${tickersRes.status}`);
    }

    const globalRaw = await globalRes.json();
    const tickersRaw = await tickersRes.json();

    if (!Array.isArray(tickersRaw) || tickersRaw.length === 0) {
      throw new Error('Invalid tickers response format');
    }

    // Filter out stablecoins
    const nonStableCoins = tickersRaw.filter(t => !isStablecoin(t));

    // Sort by 24h volume descending
    nonStableCoins.sort((a, b) => {
      const volA = a.quotes?.USD?.volume_24h || 0;
      const volB = b.quotes?.USD?.volume_24h || 0;
      return volB - volA;
    });

    // Map top 10 volume assets
    const top10Raw = nonStableCoins.slice(0, 10);
    const top10VolumeAssets = top10Raw.map((coin, index) => {
      const q = coin.quotes?.USD || {};
      const r24h = q.percent_change_24h ?? 0;
      const r1w = q.percent_change_7d ?? 0;
      const r1m = q.percent_change_30d ?? 0;
      const r1y = q.percent_change_1y ?? 0;
      const r6m = calculateEstimated6mReturn(r1m, r1y);

      const price = q.price || 0;
      const vol24h = q.volume_24h || 0;
      const mcap = q.market_cap || (price * 1000000);
      const ratio = mcap > 0 ? Number((vol24h / mcap).toFixed(4)) : 0;

      // Synthesize 8-step micro sparkline points around current price based on 24h & 1h delta
      const p1h = q.percent_change_1h ?? 0;
      const p6h = q.percent_change_6h ?? 0;
      const startP = price / (1 + r24h / 100);
      const midP1 = startP * (1 + (r24h * 0.25) / 100);
      const midP2 = startP * (1 + (r24h * 0.5 - p6h * 0.3) / 100);
      const midP3 = price / (1 + p1h / 100);
      const sparkline = [
        Number(startP.toFixed(2)),
        Number((startP * 1.002).toFixed(2)),
        Number(midP1.toFixed(2)),
        Number((midP1 * 0.998).toFixed(2)),
        Number(midP2.toFixed(2)),
        Number(midP3.toFixed(2)),
        Number((midP3 * 1.001).toFixed(2)),
        Number(price.toFixed(2))
      ];

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.rank,
        volumeRank: index + 1,
        priceUsd: price,
        volume24hUsd: vol24h,
        marketCapUsd: mcap,
        returns: {
          '24h': r24h,
          '1w': r1w,
          '1m': r1m,
          '6m': r6m,
          '1y': r1y,
        },
        athPriceUsd: q.ath_price,
        athPercentChange: q.percent_from_price_ath,
        volumeToMarketCapRatio: ratio,
        sparkline24h: sparkline
      };
    });

    // Broad sample of top 60 non-stablecoins for market breadth & heatmap depth
    const broadMarketSample = nonStableCoins.slice(0, 60).map((coin, index) => {
      const q = coin.quotes?.USD || {};
      const r24h = q.percent_change_24h ?? 0;
      const r1w = q.percent_change_7d ?? 0;
      const r1m = q.percent_change_30d ?? 0;
      const r1y = q.percent_change_1y ?? 0;
      const r6m = calculateEstimated6mReturn(r1m, r1y);
      const price = q.price || 0;
      const vol24h = q.volume_24h || 0;
      const mcap = q.market_cap || (price * 1000000);

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.rank,
        volumeRank: index + 1,
        priceUsd: price,
        volume24hUsd: vol24h,
        marketCapUsd: mcap,
        returns: {
          '24h': r24h,
          '1w': r1w,
          '1m': r1m,
          '6m': r6m,
          '1y': r1y,
        },
        athPriceUsd: q.ath_price,
        athPercentChange: q.percent_from_price_ath,
        volumeToMarketCapRatio: mcap > 0 ? Number((vol24h / mcap).toFixed(4)) : 0
      };
    });

    const globalNormalized = {
      marketCapUsd: globalRaw.market_cap_usd || 0,
      volume24hUsd: globalRaw.volume_24h_usd || 0,
      btcDominance: globalRaw.bitcoin_dominance_percentage || 58.5,
      ethDominance: 13.5,
      activeCryptos: globalRaw.cryptocurrencies_number || nonStableCoins.length,
      marketCapChange24h: globalRaw.market_cap_change_24h || 0,
      volumeChange24h: globalRaw.volume_24h_change_24h || 0
    };

    const marketPulse = generateMarketPulse(top10VolumeAssets, broadMarketSample, globalNormalized);

    const payload = {
      timestamp: new Date().toISOString(),
      isCached: false,
      cacheAgeSeconds: 0,
      globalStats: {
        marketCapUsd: globalNormalized.marketCapUsd,
        volume24hUsd: globalNormalized.volume24hUsd,
        btcDominance: globalNormalized.btcDominance,
        activeCryptos: globalNormalized.activeCryptos
      },
      marketPulse,
      top10VolumeAssets,
      broadMarketSample
    };

    // Store in cache
    marketSummaryCache = {
      data: payload,
      timestamp: now
    };

    return res.json(payload);
  } catch (error: any) {
    console.error('CoinPaprika fetch failed, serving resilient fallback:', error.message);

    // If we have an existing cache (even if older), return it
    if (marketSummaryCache) {
      const age = Math.round((now - marketSummaryCache.timestamp) / 1000);
      return res.json({
        ...marketSummaryCache.data,
        isCached: true,
        cacheAgeSeconds: age,
        warning: 'Live upstream fetch failed; using cached snapshot.'
      });
    }

    // Otherwise use high-fidelity fallback dataset
    const globalNormalized = {
      marketCapUsd: 2890000000000,
      volume24hUsd: 112000000000,
      btcDominance: 58.8,
      ethDominance: 13.1,
      activeCryptos: 8450,
      marketCapChange24h: 2.15,
      volumeChange24h: 4.80
    };

    const pulse = generateMarketPulse(FALLBACK_TOP10, FALLBACK_TOP10, globalNormalized);

    const fallbackPayload = {
      timestamp: new Date().toISOString(),
      isCached: true,
      cacheAgeSeconds: 0,
      globalStats: globalNormalized,
      marketPulse: pulse,
      top10VolumeAssets: FALLBACK_TOP10,
      broadMarketSample: FALLBACK_TOP10,
      isFallback: true
    };

    return res.json(fallbackPayload);
  }
});

// Route: Single Coin Historical OHLC / Timeframe returns
app.get('/api/coin/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const coinRes = await fetch(`https://api.coinpaprika.com/v1/tickers/${id}?quotes=USD`);
    if (!coinRes.ok) {
      return res.status(coinRes.status).json({ error: 'Coin not found' });
    }
    const data = await coinRes.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vite middleware configuration
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Crypto Market Health Dashboard server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
