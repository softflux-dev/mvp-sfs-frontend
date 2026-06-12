// src/utils/socketManager.js
// Singleton Socket.IO client — shared across all portals
// Handles: connect, reconnect, missed message recovery
// src/utils/socketManager.js — FULL REPLACEMENT
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  if (socket) { socket.disconnect(); socket = null; }

  socket = io(SERVER_URL, {
    auth:                 { token },
    reconnection:         true,
    reconnectionDelay:    1000,
    reconnectionAttempts: Infinity,
    // IMPORTANT: do NOT set global `retries` / `ackTimeout` here.
    // With `retries` set, EVERY emit (typing, joins) requires an ACK and
    // blocks the packet queue — this was making messages extremely slow.
    transports: ["websocket", "polling"],   // prefer websocket (faster on tunnels)
  });

  socket.on("connect", () => {
    socket.emit("join_conversations");
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

// Manual ACK with timeout — used ONLY for events the server actually ACKs
export const emitWithAck = (event, data, timeoutMs = 8000) => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error("Socket not connected"));
    socket.timeout(timeoutMs).emit(event, data, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};