// src/lib/socket.ts
import { io as clientIO } from 'socket.io-client';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// connect to root namespace — do NOT pass a namespace string like "/some" unless server exposes it
export const socket = clientIO(BACKEND, {
  path: '/socket.io',
  transports: ['polling','websocket'],
  withCredentials: true,
  autoConnect: true,
});

// Log connection events for debugging
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (error: any) => {
  console.error("❌ Socket connection error:", error);
});

socket.on("disconnect", (reason: string) => {
  console.log("❌ Socket disconnected:", reason);
});

// Helper function to join a specific meeting room
export const joinMeetingRoom = (roomId: string) => {
  if (!roomId) {
    console.error("❌ Room ID is missing");
    return;
  }
  console.log("📡 Joining meeting room:", roomId);
  socket.emit("join", { room: roomId });
};
