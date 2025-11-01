// ✅ server.js (Fixed & Cleaned Version)
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Initialize only once to avoid "Identifier ... already been declared" on re-run / hot reload
if (!globalThis.__connectnow_initialized) {
  globalThis.__connectnow_initialized = true;

  // app
  globalThis.__connectnow_app = express();
  globalThis.__connectnow_app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  }));
  globalThis.__connectnow_app.use(express.json());

  // http server
  globalThis.__connectnow_server = http.createServer(globalThis.__connectnow_app);

  // socket.io
  globalThis.__connectnow_io = new SocketIOServer(globalThis.__connectnow_server, {
    cors: {
      origin: [process.env.FRONTEND_URL || 'http://localhost:8080'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // simple routes for health and auth/me (defensive to avoid 500)
  globalThis.__connectnow_app.get('/health', (req, res) => res.json({ ok: true }));
  globalThis.__connectnow_app.get('/api/auth/me', (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
      // simple test response — replace with real auth logic
      return res.json({ user: { id: 'test-id', email: 'test@example.com' } });
    } catch (err) {
      console.error('/api/auth/me handler error', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // basic socket handlers
  globalThis.__connectnow_io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);
    socket.on('disconnect', () => console.log('socket disconnected:', socket.id));
  });

  // start listening
  const PORT = parseInt(process.env.PORT || '5000', 10);
  const HOST = process.env.HOST || '0.0.0.0';
  globalThis.__connectnow_server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

export const app = globalThis.__connectnow_app;
export const server = globalThis.__connectnow_server;
export const io = globalThis.__connectnow_io;
