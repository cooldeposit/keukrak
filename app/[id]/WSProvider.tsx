"use client";

import { WebSocketProvider } from "next-ws/client";

export default function WSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WebSocketProvider
      url={`${process.env.NODE_ENV === "production" ? "wss" : "ws"}://${process.env.NEXT_PUBLIC_APP_HOST}/api/ws${
        process.env.NODE_ENV === "production"
          ? "/socket.io/?EIO=3&transport=websocket"
          : ""
      }`}
    >
      {children}
    </WebSocketProvider>
  );
}
