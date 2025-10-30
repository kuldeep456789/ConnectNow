import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import meetingRoutes from './routes/meetings.js';
import engagementRoutes from './routes/engagement.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});
// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:8080' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/engagement', engagementRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Track both active users and their socket IDs
const activeUsers = {};
const userSockets = new Map(); // Track socket.id -> userId mapping

// WebSocket connection
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join meeting room
  socket.on('join-room', (meetingId, userId) => {
    socket.join(meetingId);
    if (!activeUsers[meetingId]) activeUsers[meetingId] = new Set();
    activeUsers[meetingId].add(userId);
    userSockets.set(socket.id, userId);

    console.log(`📍 ${userId} joined room ${meetingId} (Total: ${activeUsers[meetingId].size})`);
    socket.to(meetingId).emit('user-joined', userId);

    const existingUsers = Array.from(activeUsers[meetingId]).filter(id => id !== userId);
    socket.emit('existing-users', existingUsers);
  });

  // Signaling handlers (plain JS params)
  socket.on('offer', ({ target, sender, sdp }) => {
    io.to(target).emit('offer', { sender, sdp });
  });

  socket.on('answer', ({ target, sender, sdp }) => {
    io.to(target).emit('answer', { sender, sdp });
  });

  socket.on('candidate', ({ target, sender, candidate }) => {
    io.to(target).emit('candidate', { sender, candidate });
  });

  // Screen sharing signaling
  socket.on('offer-screen', ({ target, sender, sdp }) => {
    io.to(target).emit('offer-screen', { sender, sdp });
  });

  socket.on('answer-screen', ({ target, sender, sdp }) => {
    io.to(target).emit('answer-screen', { sender, sdp });
  });

  socket.on('candidate-screen', ({ target, sender, candidate }) => {
    io.to(target).emit('candidate-screen', { sender, candidate });
  });

  socket.on('stop-screen-share', (meetingId, userId) => {
    socket.to(meetingId).emit('screen-share-stopped', userId);
    console.log(`🛑 Screen share stopped by ${userId} in room ${meetingId}`);
  });

  // User leaves room
  socket.on('leave-room', (meetingId, userId) => {
    socket.leave(meetingId);

    if (activeUsers[meetingId]) {
      activeUsers[meetingId].delete(userId);
      if (activeUsers[meetingId].size === 0) {
        delete activeUsers[meetingId];
      }
    }

    userSockets.delete(socket.id);
    console.log(`👋 ${userId} left room ${meetingId}`);
    socket.to(meetingId).emit('user-left', userId);
  });

  // Engagement update
  socket.on('engagement-update', (meetingId, engagementData) => {
    socket.to(meetingId).emit('engagement-update', engagementData);
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    const uid = userSockets.get(socket.id);
    if (uid) {
      // remove socket mapping
      userSockets.delete(socket.id);
      // remove from all rooms it's in
      for (const [roomId, set] of Object.entries(activeUsers)) {
        if (set.has(uid)) {
          set.delete(uid);
          socket.to(roomId).emit('user-left', uid);
          if (set.size === 0) delete activeUsers[roomId];
        }
      }
    }
    console.log('❌ User disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.get('/health', (req, res) => res.json({ ok: true }));
server.listen(PORT, () => console.log(`Server running on ${PORT}`));