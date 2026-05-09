const cache = new Map();

export function getCached(key, ttlMs) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > ttlMs) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

export function setCached(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response from upstream (${response.status})`);
  }

  if (!response.ok) {
    const message = json?.message || json?.error || `Upstream request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return json;
}

export function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`Missing environment variable: ${name}`);
    error.status = 500;
    throw error;
  }
  return value;
}

export function sendError(res, error, fallbackMessage = 'Request failed') {
  const status = error.status && Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({
    error: fallbackMessage,
    detail: error.message
  });
}
