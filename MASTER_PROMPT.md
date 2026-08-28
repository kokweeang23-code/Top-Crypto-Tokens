# CryptoPulse — Crypto Market Health Dashboard

> **"Crypto market health in 30 seconds"**  
> Real-time non-stablecoin volume rankings, multi-timeframe return engine, performance heatmap, and instant market breadth diagnosis powered by CoinPaprika.

---

## 📋 Master Prompt Specification

```markdown
# ---- R : ROLE --------------------------------------------------
You are a senior full-stack developer and quantitative crypto UI engineer specializing in high-performance financial dashboards, real-time API normalization, data visualization, and responsive modern web design (React 19, TypeScript, Tailwind CSS, Express).

# ---- G : GOAL --------------------------------------------------
Build a lightning-fast, investor-focused Crypto Market Dashboard delivering "Crypto market health in 30 seconds":
1. Top 10 Non-Stablecoin Cryptos: Dynamically rank and display the top 10 crypto assets by 24h trading volume, strictly excluding fiat-pegged stablecoins (USDT, USDC, DAI, FDUSD, USDE, etc.), showing real-time price, 24h change, 24h volume, and market cap.
2. Multi-Timeframe Historical Returns Engine: Calculate and display performance across 1W (7d), 1M (30d), 6M (180d), and 12M (1Y) intervals.
3. Interactive Performance Heatmap: Visually map relative asset performance across selected time horizons to spot winners, laggards, and sector divergence in real time.
4. Market Pulse & Breadth Metrics: Aggregate volume concentration, Advance/Decline ratio, and market momentum into an instant health diagnosis meter.
5. Frictionless Investor UI: Deliver a clean, no-login, clutter-free dashboard with shareable market snapshot functionality and instant responsive filters.

# ---- O : OUTPUT ------------------------------------------------
Deliver a modular, production-ready codebase:
- Frontend: Single-page React application with Tailwind CSS, Lucide icons, Motion transitions, and clean typography.
- Calculation & Normalization Layer: Dedicated modules for CoinPaprika API ingestion, stablecoin filtering, OHLC/historical returns computation, and market breadth scoring.
- Caching & Resiliency: In-memory/client caching layer (60s–120s TTL) to prevent rate limits and ensure sub-second loads.
- Components: Market Pulse Bar, Top 10 Volume Matrix, Performance Heatmap Grid, Asset Detail/Return cards, and Snapshot Exporter.

# ---- G : GUARDRAILS --------------------------------------------
- Do NOT expose or hardcode any API tokens/keys in client-side code, public bundles, or repositories; all sensitive credentials must strictly reside in Vercel Environment Variables and be accessed via server-side endpoints/proxies.
- Do NOT include stablecoins or wrapped fiat tokens (USDT, USDC, DAI, FDUSD, USDD, PYUSD, etc.) in the volume rankings.
- Do NOT make unthrottled API calls to CoinPaprika; implement client/server caching to strictly respect free-tier rate limits.
- Do NOT enforce login walls or mandatory authentication for core dashboard metrics (MVP is frictionless self-service).
- Do NOT create cluttered, overly dense terminal noise; prioritize clarity, high visual contrast, and instant scannability (WCAG AA compliant).
- Handle API failures gracefully with cached fallbacks, skeletons, and clear status indicators.

# ---- C : CONTEXT -----------------------------------------------
- Target Audience: Active crypto investors, retail traders, and long-term allocators seeking rapid market context without overwhelming terminal complexity.
- Data Source: CoinPaprika Free Tier API (coins, tickers, historical/OHLC endpoints).
- Tech & Deployment Stack: React 19 + TypeScript + Tailwind CSS, versioned on GitHub and optimized for Vercel/Cloud Run.
- Product Roadmap: MVP (100% Free core dashboard) -> Future Freemium (custom watchlists, price alerts, Telegram summaries, data export).
```

---

## 🏗️ Project Architecture & Framework Mapping

| Miro Framework Component | Implementation Details |
| :--- | :--- |
| **Key Partners** | **CoinPaprika API** (Primary market feed), **Vercel / Cloud Run** (Hosting & edge delivery), **GitHub** (Version control & CI/CD). |
| **Key Activities** | Real-time API normalization, strict stablecoin exclusion filtering, multi-horizon returns computation (24H, 1W, 1M, 6M, 12M), dynamic heatmap generation, and Advance/Decline breadth scoring. |
| **Key Resources** | CoinPaprika API ingestion pipeline, server-side in-memory caching engine (60s TTL), React 19 frontend calculation layer. |
| **Value Proposition** | *"Crypto market health in 30 seconds"* — actionable, high-signal crypto liquidity dashboard without terminal complexity. |
| **Channels** | Responsive Web App, PWA-ready, shareable Markdown market snapshot cards with dynamic mobile QR code generation (`api.qrserver.com`). |
| **Customer Segments** | Retail traders seeking rapid context, active momentum allocators, long-term investors tracking relative sector rotation. |
| **Cost Structure** | Zero-cost MVP tier: Free-tier CoinPaprika endpoints, free-tier Vercel hosting & GitHub infrastructure. |
| **Revenue Roadmap** | MVP (100% Free self-service) ➔ Future Freemium (custom watchlists, price alerts, Telegram summaries, data exports). |

---

## 🔒 Security & Environment Variables

All API keys and tokens are securely managed server-side and never exposed to client-side bundles:

```env
# Server-side environment variables (Set in Vercel / Cloud Run settings)
COINPAPRIKA_API_KEY="" # Optional: for Pro tier rate limits
APP_URL=""
```

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```
