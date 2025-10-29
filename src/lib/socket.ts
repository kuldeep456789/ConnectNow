// src/lib/socket.ts
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Get token from localStorage and pass to socket
const token = localStorage.getItem("auth_token") || "";

export const socket = io(SOCKET_URL, {
  auth: {
    token,
  },
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 5,
  upgrade: true,
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
