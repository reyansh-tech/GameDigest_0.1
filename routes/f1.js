import { Router } from 'express';
import { fetchJson, getCached, sendError, setCached } from './_shared.js';

const router = Router();
const TTL_RESULTS = 300_000;
const TTL_NEXT = 1_800_000;

router.get('/', async (req, res) => {
  const year = req.query.year || String(new Date().getFullYear());
  const kind = req.query.kind === 'next' ? 'next' : 'results';
  const cacheKey = `f1:${year}:${kind}`;
  const cached = getCached(cacheKey, kind === 'next' ? TTL_NEXT : TTL_RESULTS);
  if (cached) return res.json(cached);

  try {
    const url = kind === 'next'
      ? `https://api.jolpi.ca/ergast/f1/${encodeURIComponent(year)}/next.json`
      : `https://api.jolpi.ca/ergast/f1/${encodeURIComponent(year)}/results.json?limit=5`;
    const data = await fetchJson(url);
    if (!Array.isArray(data?.MRData?.RaceTable?.Races)) {
      return res.status(502).json({ error: 'Invalid F1 response from upstream' });
    }
    setCached(cacheKey, data);
    res.json(data);
  } catch (error) {
    sendError(res, error, 'F1 proxy failed');
  }
});

export default router;
