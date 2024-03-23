"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import Timer from "@/app/components/Timer";
import useTimer from "@/app/hooks/useTimer";
import { j } from "@/app/lib/utils";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ChatPayloadType, MessageType } from "../types/message";
import { NicknameType, RoomType, UserType } from "../types/room";
import type { Memo } from "@/app/components/Main";

type BubbleProps = {
  text: string;
  memos?: Memo[];
  setMemos?: Dispatch<SetStateAction<Memo[]>>;
  isMine: boolean;
  nickname: NicknameType;
  users?: string[];
};

export const MODERATOR = "사회자";

export function Bubble({
  nickname,
  text,
  isMine,
  memos,
  setMemos,
  users,
}: BubbleProps) {
  const detailRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (detailRef.current) {
      detailRef.current.open = false;
    }
  };

  const handleMemoClick = ({ nickname, name, isAI }: Memo) => {
    if (!setMemos) {
      return;
    }

    setMemos((prev) => {
      if (prev.find((memo) => memo.nickname === nickname)) {
        return prev.map((memo) =>
          memo.nickname === nickname ? { ...memo, name, isAI } : memo,
        );
      }

      return [...prev, { nickname, name, isAI }];
    });

    closeMenu();
  };

  const handleRemoveMemoClick = () => {
    if (!setMemos) {
      return;
    }

    setMemos((prev) => prev.filter((memo) => memo.nickname !== nickname?.name));

    closeMenu();
  };

  const guess =
    memos === undefined
      ? undefined
      : memos.find((memo) => memo.nickname === nickname?.name);

  return (
    <div className={`chat ${isMine ? "chat-end" : "chat-start"} flex flex-col`}>
      {!isMine && (
        <div className="chat-header ml-12 flex items-center gap-1">
          <div className="mb-1 ml-0.5 whitespace-nowrap text-sm font-medium">
            {nickname.name}
          </div>
          {nickname.name !== MODERATOR && memos && setMemos && users && (
            <details className="dropdown dropdown-bottom" ref={detailRef}>
              <summary className="btn btn-xs mb-1 flex items-center gap-1">
                {guess ? (
                  <>
                    <span>{guess.name ?? "AI"}</span>
                    <RotateCcw size={16} className="flex-none" />
                  </>
                ) : (
                  <span>메모</span>
                )}
              </summary>
              <ul className="menu dropdown-content z-10 w-28 rounded-xl bg-base-100 p-2 font-bold shadow">
                {users.map((name) => (
                  <li key={name}>
                    <button
                      onClick={() =>
                        handleMemoClick({
                          nickname: nickname.name,
                          name,
                          isAI: false,
                        })
                      }
                    >
                      {name}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() =>
                      handleMemoClick({ nickname: nickname.name, isAI: true })
                    }
                  >
                    AI
                  </button>
                </li>
                <li>
                  <button onClick={handleRemoveMemoClick}>메모 삭제</button>
                </li>
              </ul>
            </details>
          )}
        </div>
      )}
      <div
        className={j("flex items-end gap-4", isMine ? "flex-row-reverse" : "")}
      >
        <div
          className="flex size-8 flex-none items-center justify-center rounded-full"
          style={{
            backgroundColor: nickname.color,
          }}
        >
          <span className="text-xs font-bold">{nickname.icon}</span>
        </div>
        <div
          className={j(
            "chat-bubble pt-2.5",
            isMine
              ? "bg-primary text-white"
              : nickname.name === MODERATOR
                ? "bg-accent text-white"
                : "bg-zinc-200 text-zinc-800",
          )}
        >
          {text.split("\n").map((line) => (
            <>
              {line}
              <br />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Chat({
  defaultRoom,
  ws,
  memos,
  setMemos,
  pollOngoing,
}: {
  defaultRoom: RoomType;
  ws: WebSocket;
  memos: Memo[];
  setMemos: Dispatch<SetStateAction<Memo[]>>;
  pollOngoing: () => void;
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
    initialSeconds: 30,
    repeat: 5,
  });

  useEffect(() => {
    async function fetchData() {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/room/${room.id}/next`,
      );
    }

    if (nowSeconds === 0) {
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

      if (message.type === "poll") {
        pollOngoing();
      }

      if (message.type !== "message") return;

      if (message.id !== room.id) return;

      const content = message.payload as ChatPayloadType;

      setRoom((prev) => ({
        ...prev,
        chats: [
          ...prev.chats,
          {
            message: content.content,
            created_at: new Date(),
            nickname: content.nickname,
          },
        ],
      }));

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
      <button
        className="hover:opacity-1 fixed left-1/2 top-0 z-50 -translate-x-1/2 p-4 text-sm font-bold text-white opacity-20"
        onClick={() => {
          setRoom((prev) => ({
            ...prev,
            pollOngoing: true,
          }));
        }}
      >
        투표 시작
      </button>
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
            disabled={loading}
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
