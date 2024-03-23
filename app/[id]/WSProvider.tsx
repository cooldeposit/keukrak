"use client";

import { WebSocketProvider } from "next-ws/client";

export default function WSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WebSocketProvider url={`ws://${process.env.NEXT_PUBLIC_APP_HOST}/api/ws`}>
      {children}
    </WebSocketProvider>
  );
}
