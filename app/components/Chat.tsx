"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { j } from "@/app/lib/utils";
import type { RequireAtLeastOne } from "@/app/types/util";
import { RotateCcw } from "lucide-react";
import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useCallback,
} from "react";
import { NicknameType, RoomType, UserType } from "../types/room";
import { useWebSocket } from "next-ws/client";
import { ChatPayloadType, MessageType } from "../types/message";
import { useRouter } from "next/navigation";

type BubbleProps = {
  text: string;
  memos?: Memo[];
  setMemos?: Dispatch<SetStateAction<Memo[]>>;
  isMine: boolean;
  nickname: NicknameType;
  users: string[];
};

type Memo = {
  nickname: string;
  name: string;
};

const MODERATOR = "사회자";

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

  const handleMemoClick = ({ nickname, name }: Memo) => {
    if (!setMemos) {
      return;
    }

    setMemos((prev) => {
      if (prev.find((memo) => memo.nickname === nickname)) {
        return prev.map((memo) =>
          memo.nickname === nickname ? { ...memo, name } : memo,
        );
      }

      return [...prev, { nickname, name }];
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
    <div className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
      {!isMine && (
        <div className="chat-header flex items-center gap-1">
          <div className="mb-1 ml-0.5 whitespace-nowrap text-sm font-medium">
            {nickname.name}
          </div>
          {nickname.name !== MODERATOR && memos && setMemos && (
            <details className="dropdown dropdown-bottom" ref={detailRef}>
              <summary className="btn btn-xs mb-1 flex items-center gap-1">
                {guess ? (
                  <>
                    <span>{guess.name}</span>
                    <RotateCcw size={16} />
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
                        handleMemoClick({ nickname: nickname.name, name })
                      }
                    >
                      {name}
                    </button>
                  </li>
                ))}
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
          className="flex h-6 w-6 items-center justify-center rounded-full"
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
                : "bg-slate-200 text-slate-800",
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

export function Chat({ defaultRoom }: { defaultRoom: RoomType }) {
  const [me, setMe] = useState<(UserType & { nickname: NicknameType }) | null>(
    null,
  );
  const [memos, setMemos] = useState<Memo[]>([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState(defaultRoom);
  const [loading, setLoading] = useState(false);

  const [canEnter, setCanEnter] = useState(false);

  const ws = useWebSocket();
  const router = useRouter();

  const getMe = async () => {
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
  };

  useEffect(() => {
    getMe();
  }, []);

  const handleSend = async () => {
    if (!me) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/chat/${room.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: me.id,
            message: input,
          }),
        },
      );

      setRoom((prev) => ({
        ...prev,
        chats: [
          ...prev.chats,
          {
            message: input,
            created_at: new Date(),
            userId: me.id,
            nickname: me.nickname,
          },
        ],
      }));

      ws?.send(
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
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };
  const onMessage = useCallback(async (event: MessageEvent<Blob>) => {
    const payload = await event.data.text();
    const message: MessageType = JSON.parse(payload);

    if (message.type !== "message") return;
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
  }, []);

  useEffect(() => {
    ws?.addEventListener("message", onMessage);
    return () => ws?.removeEventListener("message", onMessage);
  }, [onMessage, ws]);

  return canEnter ? (
    <div className="flex-grow">
      <div className="flex h-full flex-grow flex-col gap-3 p-4 pb-28 pt-16">
        {room.chats.map((chat) => (
          <Bubble
            isMine={chat.nickname.name === me?.nickname.name}
            nickname={chat.nickname}
            text={chat.message}
            memos={memos}
            setMemos={setMemos}
            users={room.users.map((user) => user.username)}
          />
        ))}
      </div>
      <BottomSheet>
        <div className="flex w-full items-end gap-2">
          <div className="flex flex-grow flex-col gap-1">
            <span className="text-medium ml-1 text-sm font-semibold text-neutral">
              보낼 메시지
            </span>
            <input
              placeholder="안녕하세요?"
              type="text"
              className="input input-bordered flex-grow"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
