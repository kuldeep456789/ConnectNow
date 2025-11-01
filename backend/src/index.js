// ✅ server.js (Fixed & Cleaned Version)
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import authRouter from './routes/auth.js';

// create or reuse the express app (prevents "Cannot redeclare 'app'")
const app = globalThis.__connectnow_app || express();
if (!globalThis.__connectnow_app) {
  globalThis.__connectnow_app = app;

  // middleware / routes only register once
  app.use(express.json());

  // allow the front-end origin (Vite is running on 8080)
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow curl/postman (no Origin)
      return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS']
  }));

  // simple logger
  app.use((req, res, next) => { console.log(new Date().toISOString(), req.method, req.path, 'from', req.headers.origin); next(); });

  // mount routers AFTER cors/json
  app.use('/api/auth', authRouter);
}

// create or reuse the http server
const server = globalThis.__connectnow_server || http.createServer(app);
if (!globalThis.__connectnow_server) {
  globalThis.__connectnow_server = server;
  server.listen(process.env.PORT || 5000, () => console.log(`Server running on http://0.0.0.0:${process.env.PORT || 5000}`));
}

// ensure socket.io is created once and configured to use the same "/socket.io" path & CORS
const io = globalThis.__connectnow_io || new SocketIOServer(server, {
  path: '/socket.io',
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:8080', 'http://localhost:5173'],
    methods: ['GET','POST'],
    credentials: true
  },
  transports: ['polling','websocket'],
  pingInterval: 25000,
  pingTimeout: 60000
});

if (!globalThis.__connectnow_io) {
  globalThis.__connectnow_io = io;

  // attach handlers on the root namespace to accept client root connections
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on('disconnect', (reason) => console.log('socket disconnected', socket.id, reason));
  });

  // optional: create any explicit namespaces you expect (example "/chat")
  // io.of('/chat').on('connection', s => { console.log('chat ns connected', s.id); });
}

// export if other modules import this file (optional)
export { app, server, io };
