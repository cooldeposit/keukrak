"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import Timer from "@/app/components/Timer";
import useTimer from "@/app/hooks/useTimer";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ChatPayloadType,
  MessageType,
  QuestionPayloadType,
} from "../../types/message";
import { NicknameType, RoomType, UserType } from "../../types/room";
import type { Memo } from "@/app/components/Main";
import { getAdmin } from "../../lib/getAdmin";
import { Bubble } from "./Bubble";

export function Chat({
  defaultRoom,
  ws,
  memos,
  setMemos,
  setPollOngoingTrue: pollOngoing,
}: {
  defaultRoom: RoomType;
  ws: WebSocket;
  memos: Memo[];
  setMemos: Dispatch<SetStateAction<Memo[]>>;
  setPollOngoingTrue: () => void;
}) {
  const [me, setMe] = useState<(UserType & { nickname: NicknameType }) | null>(
    null,
  );
  const [input, setInput] = useState("");
  const [room, setRoom] = useState(defaultRoom);
  const [loading, setLoading] = useState(false);

  const [canEnter, setCanEnter] = useState(false);

  const router = useRouter();

  const { startTimer, nowSeconds, isDone } = useTimer({
    initialSeconds: 45,
    repeat: 5,
  });

  useEffect(() => {
    async function fetchData() {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/room/${room.id}/next`,
      );
    }

    if (nowSeconds === 0 && getAdmin(room)?.id === me?.id) {
      fetchData();
    }
  }, [nowSeconds, room.id]);

  useEffect(() => {
    if (isDone) {
      pollOngoing();
    }
  }, [isDone]);

  useEffect(() => {
    setTimeout(() => {
      startTimer();
    }, 5000);
  }, [startTimer]);

  const getMe = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || room.users.every((user) => user.id !== userId)) {
      console.log(userId, room.users);
      router.push("/");
    }
    const res: UserType & { nickname: NicknameType } = await (
      await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/me/${room.id}/${userId}`,
      )
    ).json();
    setMe(res);
    setCanEnter(true);
  }, [room.id, room.users, router]);

  const handleSend = async () => {
    if (!me) return;
    try {
      setLoading(true);
      await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/chat/${room.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: me.id,
          message: input,
        }),
      });

      ws.send(
        JSON.stringify({
          type: "message",
          id: room.id,
          payload: {
            nickname: me.nickname,
            content: input,
          },
        }),
      );
      setInput("");
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onMessage = useCallback(
    async (event: MessageEvent) => {
      const payload = event.data as string;
      const message: MessageType = JSON.parse(payload);

      console.log(message);

      if (message.id !== room.id) return;

      if (message.type === "poll") {
        pollOngoing();
      }

      if (message.type === "question") {
        setRoom((prev) => ({
          ...prev,
          currentQuestion: (message.payload as QuestionPayloadType)
            .currentQuestion,
          questions: [
            ...prev.questions,
            (message.payload as QuestionPayloadType).question,
          ],
        }));
      }

      if (message.type !== "message") return;

      const content = message.payload as ChatPayloadType;

      setRoom((prev) => {
        if (
          prev.chats[prev.chats.length - 1]?.message === content.content &&
          prev.chats[prev.chats.length - 1]?.nickname.name ===
            content.nickname.name
        )
          return prev;
        return {
          ...prev,
          chats: [
            ...prev.chats,
            {
              message: content.content,
              created_at: new Date(),
              nickname: content.nickname,
            },
          ],
        };
      });

      setTimeout(scrollToBottom, 100);
    },
    [room.id],
  );

  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (!chatRef.current) return;
    chatRef.current.scroll({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
    console.log(chatRef.current.scrollHeight);
  }, [chatRef]);

  useEffect(() => {
    ws?.addEventListener("message", onMessage);
    return () => ws?.removeEventListener("message", onMessage);
  }, [onMessage, ws]);

  useEffect(() => {
    getMe();
  }, [getMe]);

  useEffect(() => {
    scrollToBottom();
  }, [canEnter]);

  return canEnter ? (
    <div className="h-[100dvh] flex-grow overflow-auto pb-36" ref={chatRef}>
      <div className="fixed top-0 z-50 mx-auto w-full max-w-lg items-center p-4 text-right font-bold">
        <Timer nowSeconds={nowSeconds} />
      </div>
      <div className="flex flex-grow flex-col gap-3 p-4 pt-16">
        {room.chats.map((chat, i) => (
          <Bubble
            isMine={chat.nickname.name === me?.nickname.name}
            nickname={chat.nickname}
            text={chat.message}
            memos={memos}
            setMemos={setMemos}
            users={
              room.users
                .filter((user) => user.id !== me?.id)
                .map((user) => user.username) ?? []
            }
            key={i}
          />
        ))}
      </div>
      <BottomSheet>
        <div className="flex w-full items-end gap-2">
          <div className="flex flex-grow flex-col gap-1">
            <span className="text-medium ml-1 text-sm font-semibold text-neutral">
              {room.concept}.<br />
              질문: “{room.questions[room.currentQuestion]}”
            </span>
            <input
              placeholder="안녕하세요?"
              type="text"
              className="input input-bordered flex-grow"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              disabled={loading}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={loading || input.length === 0}
          >
            전송
          </button>
        </div>
      </BottomSheet>
    </div>
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <div className="loading text-primary" />
    </div>
  );
}
