import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import meetingRoutes from './routes/meetings.js';
import engagementRoutes from './routes/engagement.js';
import { AuthenticatedRequest, authMiddleware } from './middleware/auth.js';
import { query } from './config/database.js';

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

// WebSocket connection
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join meeting room
  socket.on('join-room', (meetingId: string, userId: string) => {
    socket.join(meetingId);
    console.log(`📍 ${userId} joined room ${meetingId}`);
    socket.to(meetingId).emit('user-joined', userId);
  });

  // Handle offer
  socket.on('offer', ({ target, sender, sdp }: { target: string; sender: string; sdp: string }) => {
    io.to(target).emit('offer', { sender, sdp });
  });

  // Handle answer
  socket.on('answer', ({ target, sender, sdp }: { target: string; sender: string; sdp: string }) => {
    io.to(target).emit('answer', { sender, sdp });
  });

  // Handle ICE candidate
  socket.on('candidate', ({ target, sender, candidate }: { target: string; sender: string; candidate: any }) => {
    io.to(target).emit('candidate', { sender, candidate });
  });

  // Screen sharing - offer
  socket.on('offer-screen', ({ target, sender, sdp }: { target: string; sender: string; sdp: string }) => {
    io.to(target).emit('offer-screen', { sender, sdp });
  });

  // Screen sharing - answer
  socket.on('answer-screen', ({ target, sender, sdp }: { target: string; sender: string; sdp: string }) => {
    io.to(target).emit('answer-screen', { sender, sdp });
  });

  // Screen sharing - ICE candidate
  socket.on('candidate-screen', ({ target, sender, candidate }: { target: string; sender: string; candidate: any }) => {
    io.to(target).emit('candidate-screen', { sender, candidate });
  });

  // Screen sharing - answer
  socket.on('answer-screen', ({ target, sender, sdp }: { target: string; sender: string; sdp: string }) => {
    io.to(target).emit('answer-screen', { sender, sdp });
  });

  // Stop screen share
  socket.on('stop-screen-share', (meetingId: string) => {
    socket.to(meetingId).emit('screen-share-stopped');
  });

  // User left room
  socket.on('leave-room', (meetingId: string, userId: string) => {
    socket.leave(meetingId);
    console.log(`👋 ${userId} left room ${meetingId}`);
    socket.to(meetingId).emit('user-left', userId);
  });

  // Engagement data update
  socket.on('engagement-update', (meetingId: string, engagementData: any) => {
    socket.to(meetingId).emit('engagement-update', engagementData);
  });

  // Coaching suggestion
  socket.on('coaching-suggestion', (meetingId: string, suggestion: any) => {
    socket.to(meetingId).emit('coaching-suggestion', suggestion);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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