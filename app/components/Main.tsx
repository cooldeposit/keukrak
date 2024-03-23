"use client";

import { useEffect, useRef, useState } from "react";
import { RoomType } from "../types/room";
import { Chat } from "./Chat";
import { Pending } from "./Pending";
import Result from "@/app/components/Result";
import Poll from "@/app/components/Poll";

export type Memo = {
  nickname: string;
  name?: string;
  isAI: boolean;
};

export default function Main({ room }: { room: RoomType }) {
  const [socketConnected, setSocketConnected] = useState(false);

  const webSocketUrl = process.env.NEXT_PUBLIC_WS_URL!;
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(webSocketUrl);
      ws.current.onopen = () => {
        console.log("connected to " + webSocketUrl);
        setSocketConnected(true);
      };
      ws.current.onclose = (error) => {
        console.log("disconnect from " + webSocketUrl);
        console.log(error);
      };
      ws.current.onerror = (error) => {
        console.log("connection error " + webSocketUrl);
        console.log(error);
      };
    }

    /* return () => {
      console.log("clean up");
      ws.current?.close();
    }; */
  }, []);

  useEffect(() => {
    if (socketConnected) {
      console.log("join room");
      ws.current?.send(
        JSON.stringify({
          type: "join",
          id: room.id,
        }),
      );
    }
  }, [socketConnected]);

  const [memos, setMemos] = useState<Memo[]>([]);

  return (
    ws.current && (
      <>
        {room.hasEnded === false &&
          room.pollOngoing === false &&
          room.currentQuestion === -1 && (
            <Pending defaultRoom={room} ws={ws.current} />
          )}
        {room.hasEnded === false &&
          room.pollOngoing === false &&
          room.currentQuestion >= 0 && (
            <Chat
              defaultRoom={room}
              ws={ws.current}
              memos={memos}
              setMemos={setMemos}
            />
          )}
        {room.pollOngoing && (
          <Poll defaultRoom={room} ws={ws.current} memos={memos} />
        )}
        {room.hasEnded && (
          <Result defaultRoom={room} ws={ws.current} memos={memos} />
        )}
      </>
    )
  );
}
