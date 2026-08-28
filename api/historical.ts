// Vercel Serverless Function: /api/historical
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { coinId } = req.query;
  if (!coinId) {
    return res.status(400).json({ error: 'coinId is required' });
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'CryptoPulse-Dashboard/1.0',
    };
    if (process.env.COINPAPRIKA_API_KEY) {
      headers['Authorization'] = process.env.COINPAPRIKA_API_KEY;
    }

    const tickerRes = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}?quotes=USD`, { headers });
    if (!tickerRes.ok) {
      return res.status(tickerRes.status).json({
        error: `Could not fetch ticker for ${coinId}`,
      });
    }

    const data = await tickerRes.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to fetch historical data',
      message: error?.message || 'Internal server error',
    });
  }
}
