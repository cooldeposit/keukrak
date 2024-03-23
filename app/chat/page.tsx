"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "next-ws/client";
import { MessageType } from "../types/message";

const name = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace"][
  Math.floor(Math.random() * 7)
];

export default function Page() {
  const ws = useWebSocket();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    /* if (ws?.CONNECTING || ws?.CLOSED) {
      console.log(
        "WebSocket connection is not established or has been closed."
      );
      return;
    } */
    ws?.send(JSON.stringify({ user: name, content: input }));
    setMessages((messages) => [...messages, { user: name, content: input }]);
    setInput("");
  }, [input, ws]);

  const onMessage = useCallback(async (event: MessageEvent<Blob>) => {
    const payload = await event.data.text();
    const message = JSON.parse(payload) as MessageType;
    setMessages((messages) => [...messages, message]);
  }, []);

  useEffect(() => {
    ws?.addEventListener("message", onMessage);
    return () => ws?.removeEventListener("message", onMessage);
  }, [onMessage, ws]);

  return (
    <div className="flex h-[100dvh] w-full flex-col justify-end">
      <div className="w-full">
        {messages.map((message, i) => (
          <div key={i}>
            <strong>{message.user}</strong>: {message.content}
          </div>
        ))}
      </div>

      <div className="flex w-full gap-2 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.nativeEvent.isComposing) return;

              handleSend();
            }
          }}
          className="input input-bordered flex-grow"
          type="text"
          placeholder="Your message"
        />
        <button type="button" onClick={handleSend} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}
