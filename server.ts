import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { getDb } from './src/server/db';
import { createApiRouter } from './src/server/routes';
import {
  initHardwareSimulator,
  startConveyor,
  stopConveyor,
  pauseConveyor,
  emergencyStop,
  simulateFault
} from './src/server/hardware-simulator';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // Initialize SQLite database
  console.log('Initializing ParcelFlow SQLite database...');
  await getDb();
  console.log('Database ready.');

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });

  // Initialize hardware simulation engine
  initHardwareSimulator(io);

  // Client socket handlers
  io.on('connection', (socket) => {
    socket.on('conveyor:start', () => startConveyor());
    socket.on('conveyor:stop', () => stopConveyor());
    socket.on('conveyor:pause', () => pauseConveyor());
    socket.on('conveyor:emergency_stop', () => emergencyStop());
    socket.on('debug:simulate_fault', (data: { target: 'wifi' | 'sensor' | 'robot' | 'clear' }) => {
      simulateFault(data.target);
    });
  });

  // API Routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api', createApiRouter(io));

  // Catch-all for API routes to prevent fallback to SPA HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ParcelFlow Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
