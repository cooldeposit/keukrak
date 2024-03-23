"use client";

import { ReactNode } from "react";
import { WebSocketProvider } from "next-ws/client";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WebSocketProvider url={`ws://${process.env.NEXT_PUBLIC_APP_HOST}/api/ws`}>
      {children}
    </WebSocketProvider>
  );
}
