// src/config.ts

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://goldilivepainelgeral.com";

// ✅ Add this (Socket.IO base URL)
export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ??
  API_BASE_URL; // use same domain if you proxy socket server behind this domain

// ✅ Fix the trailing quote + allow env override
export const LIVEKIT_WS_URL =
  process.env.EXPO_PUBLIC_LIVEKIT_WS_URL ?? "wss://your-livekit-domain";
