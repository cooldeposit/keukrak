"use client";

import { WebSocketProvider } from "next-ws/client";

export default function WSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(process.env.NEXT_PUBLIC_IS_HTTPS);
  return (
    <WebSocketProvider
      url={`${process.env.NEXT_PUBLIC_IS_HTTPS === "true" ? "wss" : "ws"}://${process.env.NEXT_PUBLIC_APP_HOST}/api/ws${
        process.env.NEXT_PUBLIC_IS_HTTPS === "true"
          ? "/socket.io/?EIO=3&transport=websocket"
          : ""
      }`}
    >
      {children}
    </WebSocketProvider>
  );
}
