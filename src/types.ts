export type Timeframe = '24h' | '1w' | '1m' | '6m' | '1y';

export interface CryptoQuote {
  price: number;
  volume_24h: number;
  market_cap: number;
  percent_change_15m?: number;
  percent_change_30m?: number;
  percent_change_1h?: number;
  percent_change_6h?: number;
  percent_change_12h?: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  percent_change_6m?: number;
  percent_change_1y: number;
  percent_from_price_ath?: number;
  ath_price?: number;
  ath_date?: string;
  volume_24h_change_24h?: number;
  market_cap_change_24h?: number;
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  volumeRank: number;
  priceUsd: number;
  volume24hUsd: number;
  marketCapUsd: number;
  returns: {
    '24h': number;
    '1w': number;
    '1m': number;
    '6m': number;
    '1y': number;
  };
  athPriceUsd?: number;
  athPercentChange?: number;
  volumeToMarketCapRatio: number;
  sparkline24h?: number[];
}

export interface MarketPulse {
  healthScore: number; // 0 to 100
  sentiment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  summary30s: string;
  advancingCount: number;
  decliningCount: number;
  unchangedCount: number;
  advanceDeclineRatio: number;
  totalMarketCapUsd: number;
  totalVolume24hUsd: number;
  top10VolumeSharePercent: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  volumeChange24h: number;
  dominantTrendTimeframe: '24h' | '1w' | '1m';
  topGainer24h?: { symbol: string; name: string; change: number };
  topLaggard24h?: { symbol: string; name: string; change: number };
}

export interface MarketDashboardData {
  timestamp: string;
  isCached: boolean;
  cacheAgeSeconds: number;
  globalStats: {
    marketCapUsd: number;
    volume24hUsd: number;
    btcDominance: number;
    activeCryptos: number;
  };
  marketPulse: MarketPulse;
  top10VolumeAssets: CryptoAsset[];
  broadMarketSample: CryptoAsset[];
}
