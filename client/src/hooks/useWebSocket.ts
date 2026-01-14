import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useWebSocket = (onProgress?: (data: any) => void) => {
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    
    socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("progress", (data) => {
      onProgress?.(data);
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [onProgress]);

  return socket;
};

export const emitProgress = (event: string, data: any) => {
  if (socket) {
    socket.emit(event, data);
  }
};
