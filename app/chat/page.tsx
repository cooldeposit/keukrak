"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "next-ws/client";
import { ChatType } from "../types/message";

const name = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace"][
  Math.floor(Math.random() * 7)
];

export default function Page() {
  const ws = useWebSocket();

  const [chats, setChats] = useState<ChatType[]>([]);
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    ws?.send(JSON.stringify({ type: "chat", user: name, content: input }));
    setChats((chats) => [...chats, { user: name, content: input }]);
    setInput("");
  }, [input, ws]);

  const onMessage = useCallback(async (event: MessageEvent<Blob>) => {
    const payload = await event.data.text();
    const message = JSON.parse(payload) as ChatType;
    setChats((messages) => [...messages, message]);
  }, []);

  useEffect(() => {
    ws?.addEventListener("message", onMessage);
    return () => ws?.removeEventListener("message", onMessage);
  }, [onMessage, ws]);

  return (
    <div className="flex h-[100dvh] w-full flex-col justify-end">
      <div className="w-full">
        {chats.map((message, i) => (
          <div key={i}>
            <strong>{message.user}</strong>: {message.content}
          </div>
        ))}
      </div>

      <div className="flex w-full gap-2 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="w-full rounded border px-2 py-1"
          type="text"
          placeholder="Your message"
        />
        <button
          type="button"
          onClick={handleSend}
          className="rounded bg-black px-2 py-1 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
