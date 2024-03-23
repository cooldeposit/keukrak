"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io";
import { io as ClientIO } from "socket.io-client";

// https://github.com/AntonioErdeljac/next13-discord-clone/blob/237a649e23ed041c670c76ebb4a75c4b09122823/components/providers/socket-provider.tsx#L26
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export default function WSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_IS_HTTPS === "true" ? "wss" : "ws"}://${process.env.NEXT_PUBLIC_API_HOST}`;

    console.log(url);

    const socketInstance = new (ClientIO as any)(url, {
      path: "ws",
      // path: `/ws${
      //   process.env.NEXT_PUBLIC_IS_HTTPS === "true"
      //     ? "/socket.io/?EIO=3&transport=websocket"
      //     : ""
      // }`,
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  console.log(process.env.NEXT_PUBLIC_IS_HTTPS);
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
