import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { TrackerService } from './services/trackerService';
import { TrackerController } from './controllers/trackerController';
import { createRouter } from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer(): Promise<void> {
  let pool: Pool | null = null;
  let dbAvailable = false;

  // Attempt DB connection gracefully
  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      await pool.query('SELECT 1');
      dbAvailable = true;
      console.log('[Server] PostgreSQL connected successfully.');
    } catch (err) {
      console.warn(
        '[Server] PostgreSQL unavailable, falling back to in-memory storage.',
        (err as Error).message
      );
      if (pool) {
        await pool.end().catch(() => undefined);
        pool = null;
      }
    }
  } else {
    console.warn('[Server] No DATABASE_URL set. Using in-memory storage.');
  }

  const service = new TrackerService(pool, dbAvailable);
  const controller = new TrackerController(service);
  const router = createRouter(controller);

  app.use('/api', router);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.listen(PORT, () => {
    console.log(`[Server] Privacy Dashboard API running on http://localhost:${PORT}`);
    console.log(`[Server] Storage mode: ${dbAvailable ? 'PostgreSQL' : 'in-memory'}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
