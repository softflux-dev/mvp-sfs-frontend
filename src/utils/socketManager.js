// src/utils/socketManager.js
// Singleton Socket.IO client — shared across all portals
// Handles: connect, reconnect, missed message recovery

import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SERVER_URL, {
    auth:                { token },
    reconnection:        true,
    reconnectionDelay:   1000,
    reconnectionAttempts: Infinity,
    // At-least-once delivery — retry up to 3 times if no ACK
    retries:    3,
    ackTimeout: 10000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
    // Join all conversation rooms on connect/reconnect
    socket.emit("join_conversations");
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitWithAck = (event, data) => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket not connected"));
      return;
    }
    socket.timeout(10000).emit(event, data, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};