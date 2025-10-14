// src/lib/socket.ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ["websocket"],
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
