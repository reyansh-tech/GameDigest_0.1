import { Router } from 'express';
import { fetchJson, getCached, requiredEnv, sendError, setCached } from './_shared.js';

const router = Router();
const TTL = 45_000;

router.get('/', async (_req, res) => {
  const cacheKey = 'cricket:current';
  const cached = getCached(cacheKey, TTL);
  if (cached) return res.json(cached);

  try {
    const apiKey = requiredEnv('CRICKET_API_KEY');
    const data = await fetchJson(`https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(apiKey)}&offset=0`);
    if (!Array.isArray(data?.data)) {
      return res.status(502).json({ error: 'Invalid cricket response from upstream' });
    }
    setCached(cacheKey, data);
    res.json(data);
  } catch (error) {
    sendError(res, error, 'Cricket proxy failed');
  }
});

export default router;
