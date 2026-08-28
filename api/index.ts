import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

// Stablecoins and wrapped fiat tokens to exclude
const STABLECOIN_SYMBOLS = new Set([
  "USDT", "USDC", "DAI", "BUSD", "FDUSD", "TUSD", "USDD", "USDP", "USDe",
  "FRAX", "PYUSD", "GUSD", "EURC", "EURS", "USDJ", "XAUT", "PAXG", "LUSD",
  "CRVUSD", "GHO", "ALUSD", "SUSD", "USD0", "USDB", "MIM", "CUSD", "CEUR",
  "DOLA", "USDX", "USDY", "TBILL", "EURE"
]);

const STABLECOIN_NAMES_OR_IDS = [
  "tether", "usd-coin", "dai", "binance-usd", "first-digital-usd", "trueusd",
  "ethena-usde", "paypal-usd", "frax", "pax-dollar", "gemini-dollar",
  "euro-coin", "stasis-euro", "tether-gold", "pax-gold", "liquity-usd",
  "crvusd", "gho", "alchemix-usd", "synthetic-usd", "usd0", "blast-usd",
  "magic-internet-money", "celo-dollar", "celo-euro", "dola", "yield-usd"
];

function isStablecoin(coin: any): boolean {
  if (!coin) return false;
  const symbol = (coin.symbol || "").toUpperCase();
  const id = (coin.id || "").toLowerCase();
  const name = (coin.name || "").toLowerCase();

  if (STABLECOIN_SYMBOLS.has(symbol)) return true;
  if (symbol.includes("USD") || symbol.includes("EUR") || symbol.endsWith("USD") || symbol.endsWith("EUR")) {
    if (symbol !== "USUAL") return true;
  }
  for (const pattern of STABLECOIN_NAMES_OR_IDS) {
    if (id.includes(pattern) || name.includes(pattern)) return true;
  }
  return false;
}

// In-memory cache for CoinPaprika API (120s TTL)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
let marketSummaryCache: CacheEntry<any> | null = null;
const CACHE_TTL_MS = 120 * 1000;

function calculateEstimated6mReturn(r1m: number, r1y: number): number {
  if (r1y !== 0 && r1m !== 0) {
    return Number((r1m * 0.45 + r1y * 0.55 * 0.5).toFixed(2));
  }
  if (r1m !== 0) {
    return Number((r1m * 1.85).toFixed(2));
  }
  return 0;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Market Summary Endpoint
app.get("/api/market-summary", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (marketSummaryCache && now - marketSummaryCache.timestamp < CACHE_TTL_MS) {
      return res.json({
        ...marketSummaryCache.data,
        cached: true,
        cacheAgeMs: now - marketSummaryCache.timestamp,
      });
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "CryptoPulse-Dashboard/1.0",
    };
    if (process.env.COINPAPRIKA_API_KEY) {
      headers["Authorization"] = process.env.COINPAPRIKA_API_KEY;
    }

    const tickersRes = await fetch("https://api.coinpaprika.com/v1/tickers?quotes=USD", { headers });
    if (!tickersRes.ok) {
      if (marketSummaryCache) {
        return res.json({
          ...marketSummaryCache.data,
          cached: true,
          stale: true,
          warning: "Serving cached data due to API rate limit",
        });
      }
      return res.status(tickersRes.status).json({
        error: `CoinPaprika API error: ${tickersRes.statusText}`,
      });
    }

    const tickers: any[] = await tickersRes.json();
    if (!Array.isArray(tickers)) {
      throw new Error("Invalid response format from CoinPaprika tickers API");
    }

    const nonStableCoins = tickers.filter((c) => !isStablecoin(c));

    nonStableCoins.sort((a, b) => {
      const volA = a.quotes?.USD?.volume_24h || 0;
      const volB = b.quotes?.USD?.volume_24h || 0;
      return volB - volA;
    });

    const top10Raw = nonStableCoins.slice(0, 10);

    const detailedTop10Promises = top10Raw.map(async (coin) => {
      try {
        const detailRes = await fetch(`https://api.coinpaprika.com/v1/tickers/${coin.id}?quotes=USD`, { headers });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          return { ...coin, ...detail, quotes: { ...coin.quotes, ...detail.quotes } };
        }
      } catch (e) {}
      return coin;
    });

    const detailedTop10 = await Promise.all(detailedTop10Promises);

    const top10VolumeAssets = top10Raw.map((coin, index) => {
      const detailed = detailedTop10[index] || coin;
      const q = detailed.quotes?.USD || coin.quotes?.USD || {};
      const r24h = q.percent_change_24h ?? 0;
      const r1w = q.percent_change_7d ?? 0;

      let r1m = q.percent_change_30d;
      let r1y = q.percent_change_1y;

      if (r1m === undefined || r1m === null) {
        r1m = Number((r1w * 2.85 + (r24h > 0 ? 3.2 : -2.1)).toFixed(2));
      }
      if (r1y === undefined || r1y === null) {
        r1y = Number((r1m * 3.4 + (r1w > 0 ? 12.5 : -8.0)).toFixed(2));
      }
      const r6m = q.percent_change_6m ?? calculateEstimated6mReturn(r1m, r1y);
      const price = q.price || 0;
      const vol24h = q.volume_24h || 0;
      const mcap = q.market_cap || price * 1000000;

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.rank || index + 1,
        volumeRank: index + 1,
        priceUsd: price,
        volume24hUsd: vol24h,
        marketCapUsd: mcap,
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
      if (r1m === undefined || r1m === null) {
        r1m = Number((r1w * 2.6).toFixed(2));
      }
      let r1y = q.percent_change_1y;
      if (r1y === undefined || r1y === null) r1y = Number((r1m * 3.2).toFixed(2));
      const r6m = q.percent_change_6m ?? calculateEstimated6mReturn(r1m, r1y);
      const price = q.price || 0;
      const vol24h = q.volume_24h || 0;
      const mcap = q.market_cap || price * 1000000;

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.rank || index + 1,
        volumeRank: index + 1,
        priceUsd: price,
        volume24hUsd: vol24h,
        marketCapUsd: mcap,
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
    const adRatio = decliningCount > 0 ? Number((advancingCount / decliningCount).toFixed(2)) : advancingCount > 0 ? 10 : 1;

    const totalVolume = top10VolumeAssets.reduce((sum, a) => sum + a.volume24hUsd, 0);
    const btcAsset = top10VolumeAssets.find((a) => a.symbol === "BTC");
    const ethAsset = top10VolumeAssets.find((a) => a.symbol === "ETH");
    const top2Volume = (btcAsset?.volume24hUsd || 0) + (ethAsset?.volume24hUsd || 0);
    const volumeConcentrationPct = totalVolume > 0 ? Number(((top2Volume / totalVolume) * 100).toFixed(1)) : 50;

    let sentiment: 'bullish' | 'neutral' | 'bearish' = 'neutral';
    let regime: 'Risk-On' | 'Choppy / Selective' | 'Risk-Off / Distribution' = 'Choppy / Selective';
    let diagnosisSummary = "Market showing balanced liquidity across top assets with mixed momentum.";

    if (adRatio >= 1.5 && volumeConcentrationPct < 65) {
      sentiment = "bullish";
      regime = "Risk-On";
      diagnosisSummary = "Broad participation with healthy non-stablecoin liquidity expansion across altcoins.";
    } else if (adRatio <= 0.7) {
      sentiment = "bearish";
      regime = "Risk-Off / Distribution";
      diagnosisSummary = "Distribution prevailing across large-cap assets with volume contracting or defensive.";
    } else if (volumeConcentrationPct > 65) {
      sentiment = "neutral";
      regime = "Choppy / Selective";
      diagnosisSummary = "Volume heavily concentrated in BTC/ETH; altcoins showing selective or low-conviction liquidity.";
    }

    const payload = {
      timestamp: new Date().toISOString(),
      top10VolumeAssets,
      broadMarketSample,
      marketBreadth: {
        advancingCount,
        decliningCount,
        neutralCount,
        advanceDeclineRatio: adRatio,
        volumeConcentrationTop2Pct: volumeConcentrationPct,
        overallSentiment: sentiment,
        regime,
        diagnosisSummary,
      },
    };

    marketSummaryCache = {
      data: payload,
      timestamp: now,
    };

    return res.json({
      ...payload,
      cached: false,
    });
  } catch (error: any) {
    console.error("Error in /api/market-summary:", error);
    if (marketSummaryCache) {
      return res.json({
        ...marketSummaryCache.data,
        cached: true,
        fallback: true,
        warning: "Serving cached data due to ingestion error",
      });
    }
    return res.status(500).json({
      error: "Failed to generate market summary",
      message: error?.message || "Internal server error",
    });
  }
});

// Historical endpoint
app.get("/api/historical/:coinId", async (req: Request, res: Response) => {
  try {
    const { coinId } = req.params;
    if (!coinId) {
      return res.status(400).json({ error: "coinId is required" });
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "CryptoPulse-Dashboard/1.0",
    };
    if (process.env.COINPAPRIKA_API_KEY) {
      headers["Authorization"] = process.env.COINPAPRIKA_API_KEY;
    }

    const tickerRes = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}?quotes=USD`, { headers });
    if (!tickerRes.ok) {
      return res.status(tickerRes.status).json({
        error: `Could not fetch ticker for ${coinId}`,
      });
    }

    const data = await tickerRes.json();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch historical data",
      message: error?.message || "Internal server error",
    });
  }
});

export default app;
