import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import cricketRouter from './routes/cricket.js';
import footballRouter from './routes/football.js';
import basketballRouter from './routes/basketball.js';
import f1Router from './routes/f1.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 8080);
const distDir = path.join(__dirname, 'dist');
const frontendOrigin = process.env.FRONTEND_ORIGIN || true;

app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'gamedigest-proxy' });
});

app.use('/api/cricket', cricketRouter);
app.use('/api/football', footballRouter);
app.use('/api/basketball', basketballRouter);
app.use('/api/f1', f1Router);

app.use(express.static(distDir));

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error('[Server]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`GameDigest backend running on port ${PORT}`);
});
