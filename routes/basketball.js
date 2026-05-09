import { Router } from 'express';
import { fetchJson, getCached, requiredEnv, sendError, setCached } from './_shared.js';

const router = Router();
const TTL_TODAY = 60_000;
const TTL_PAST = 300_000;

router.get('/', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'Missing required query param: date' });

  const ttl = date === new Date().toISOString().split('T')[0] ? TTL_TODAY : TTL_PAST;
  const cacheKey = `basketball:${date}`;
  const cached = getCached(cacheKey, ttl);
  if (cached) return res.json(cached);

  try {
    const apiKey = requiredEnv('BASKETBALL_API_KEY');
    const data = await fetchJson(`https://api.balldontlie.io/v1/games?dates[]=${encodeURIComponent(date)}&per_page=5`, {
      headers: { Authorization: apiKey }
    });
    if (!Array.isArray(data?.data)) {
      return res.status(502).json({ error: 'Invalid basketball response from upstream' });
    }
    setCached(cacheKey, data);
    res.json(data);
  } catch (error) {
    sendError(res, error, 'Basketball proxy failed');
  }
});

export default router;
