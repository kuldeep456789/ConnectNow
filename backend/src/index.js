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
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Store active users per room
const activeUsers = {};

// WebSocket connection
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join meeting room
  socket.on('join-room', (meetingId, userId) => {
    socket.join(meetingId);
    
    // Initialize room if needed
    if (!activeUsers[meetingId]) {
      activeUsers[meetingId] = new Set();
    }
    activeUsers[meetingId].add(userId);
    
    console.log(`📍 ${userId} joined room ${meetingId} (Total: ${activeUsers[meetingId].size})`);
    
    // Notify others in the room that someone joined
    socket.to(meetingId).emit('user-joined', userId);
    
    // Send list of existing users to the new joiner
    const existingUsers = Array.from(activeUsers[meetingId]).filter(id => id !== userId);
    socket.emit('existing-users', existingUsers);
  });

  // Handle offer (point-to-point)
  socket.on('offer', ({ target, sender, sdp }) => {
    io.to(target).emit('offer', { sender, sdp });
  });

  // Handle answer (point-to-point)
  socket.on('answer', ({ target, sender, sdp }) => {
    io.to(target).emit('answer', { sender, sdp });
  });

  // Handle ICE candidate (point-to-point)
  socket.on('candidate', ({ target, sender, candidate }) => {
    io.to(target).emit('candidate', { sender, candidate });
  });

  // Screen sharing - offer (point-to-point)
  socket.on('offer-screen', ({ target, sender, sdp }) => {
    io.to(target).emit('offer-screen', { sender, sdp });
  });

  // Screen sharing - answer (point-to-point)
  socket.on('answer-screen', ({ target, sender, sdp }) => {
    io.to(target).emit('answer-screen', { sender, sdp });
  });

  // Screen sharing - ICE candidate (point-to-point)
  socket.on('candidate-screen', ({ target, sender, candidate }) => {
    io.to(target).emit('candidate-screen', { sender, candidate });
  });

  // Stop screen share (broadcast to room)
  socket.on('stop-screen-share', (meetingId, userId) => {
    socket.to(meetingId).emit('screen-share-stopped', userId);
    console.log(`🛑 Screen share stopped by ${userId} in room ${meetingId}`);
  });

  // User left room
  socket.on('leave-room', (meetingId, userId) => {
    socket.leave(meetingId);
    
    if (activeUsers[meetingId]) {
      activeUsers[meetingId].delete(userId);
      if (activeUsers[meetingId].size === 0) {
        delete activeUsers[meetingId];
      }
    }
    
    console.log(`👋 ${userId} left room ${meetingId}`);
    socket.to(meetingId).emit('user-left', userId);
  });

  // Engagement data update
  socket.on('engagement-update', (meetingId, engagementData) => {
    socket.to(meetingId).emit('engagement-update', engagementData);
  });

  // Coaching suggestion
  socket.on('coaching-suggestion', (meetingId, suggestion) => {
    socket.to(meetingId).emit('coaching-suggestion', suggestion);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    
    // Clean up user from all rooms
    for (const meetingId in activeUsers) {
      // Note: We don't have userId here, but Socket.io will auto-leave rooms
      socket.leave(meetingId);
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 ConnectNow Server Running          ║
║  Port: ${PORT}                               ║
║  Environment: ${process.env.NODE_ENV || 'development'}          ║
╚════════════════════════════════════════╝
  `);
});