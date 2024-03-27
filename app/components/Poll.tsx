"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Bubble } from "@/app/components/Chat";
import { Header } from "@/app/components/Header";
import type { Memo } from "@/app/components/Main";
import type { NicknameType, RoomType, UserType } from "@/app/types/room";
import { josa } from "@toss/hangul";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  type SetStateAction,
  type Dispatch,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { getAdmin } from "../lib/getAdmin";
import { MessageType } from "../types/message";

type Answer = {
  nickname: string;
  isAI: boolean;
  name?: string;
}[];

interface OptionProps {
  nickname: NicknameType;
  chats: string[];
  options: string[];
  answer: Answer | null;
  setAnswer: Dispatch<SetStateAction<Answer | null>>;
  memos: Memo[];
}

interface PollProps {
  defaultRoom: RoomType;
  ws: WebSocket;
  memos: Memo[];
  setHasEndedTrue: () => void;
  setPollOngoingFalse: () => void;
  setResult: Dispatch<SetStateAction<RoomType["result"]>>;

  organizedChats: {
    nickname: NicknameType;
    chats: string[];
  }[];
  setOrganizedChats: Dispatch<
    SetStateAction<
      {
        nickname: NicknameType;
        chats: string[];
      }[]
    >
  >;
}

function Option({
  nickname,
  chats,
  options,
  answer,
  setAnswer,
  memos,
}: OptionProps) {
  const [showingChats, setShowingChats] = useState(false);

  const toggleChats = () => setShowingChats((prev) => !prev);

  const guess = answer?.find((a) => a.nickname === nickname.name);
  const memoGuess = memos.find((memo) => memo.nickname === nickname.name);

  const detailRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (detailRef.current) {
      detailRef.current.open = false;
    }
  };

  const handleSelectClick = ({
    nickname,
    name,
    isAI,
  }: {
    nickname: string;
    name?: string;
    isAI: boolean;
  }) => {
    setAnswer((prev) => {
      if (!prev) {
        return [{ nickname, name, isAI }];
      }

      if (prev.find((item) => item.nickname === nickname)) {
        return prev.map((item) =>
          item.nickname === nickname ? { ...item, name, isAI } : item,
        );
      }

      return [...prev, { nickname, name, isAI }];
    });

    closeMenu();
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-zinc-300 bg-zinc-100 p-4">
      <div className="flex w-full flex-row flex-wrap items-center justify-between gap-2 text-sm font-medium text-zinc-600">
        <div className="flex flex-col">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <div
              className="flex size-6 flex-none items-center justify-center rounded-full"
              style={{
                backgroundColor: nickname.color,
              }}
            >
              <span className="text-xs font-bold">{nickname.icon}</span>
            </div>
            {nickname.name}
          </h2>
          <p>
            {memoGuess && (memoGuess.name || memoGuess.isAI)
              ? `${josa(
                  memoGuess.isAI ? "AI" : memoGuess.name!,
                  "으로/로",
                )} 메모함`
              : "메모 안 함"}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={toggleChats}>
            채팅 {showingChats ? "닫기" : "열기"}
          </button>
          <details className="dropdown dropdown-left" ref={detailRef}>
            <summary className="btn btn-primary btn-sm flex items-center gap-2">
              {guess ? (
                <>
                  <span>{guess?.name ?? "AI"}</span>
                  <RotateCcw size={16} className="flex-none" />
                </>
              ) : (
                <span>선택</span>
              )}
            </summary>
            <ul className="menu dropdown-content z-10 mr-2 w-28 rounded-xl bg-base-100 p-2 font-bold shadow">
              {options.map((name) => (
                <li key={name}>
                  <button
                    onClick={() =>
                      handleSelectClick({
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
                    handleSelectClick({ nickname: nickname.name, isAI: true })
                  }
                >
                  AI
                </button>
              </li>
            </ul>
          </details>
        </div>
      </div>
      {showingChats && (
        <div className="flex flex-col gap-3 rounded-md pt-3">
          {chats.map((chat, index) => (
            <Bubble
              key={index}
              nickname={nickname}
              text={chat}
              isMine={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Poll({
  defaultRoom,
  ws,
  memos,
  setHasEndedTrue: hasEnded,
  setPollOngoingFalse: pollOngoing,
  setResult,
  organizedChats,
  setOrganizedChats,
}: PollProps) {
  const [me, setMe] = useState<(UserType & { nickname: NicknameType }) | null>(
    null,
  );
  const [waiting, setWaiting] = useState(false);

  const [room, setRoom] = useState<RoomType>(defaultRoom);

  const fetchRoom = async () => {
    try {
      const res: RoomType = await (
        await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/room/${room.id}`, {
          cache: "no-cache",
        })
      ).json();

      setRoom(res);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  const router = useRouter();

  const [answer, setAnswer] = useState<Answer | null>(null);

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
  }, [room.id, room.users, router]);

  const onMessage = useCallback(
    async (event: MessageEvent) => {
      const payload = event.data as string;
      const message: MessageType = JSON.parse(payload);

      if (message.id !== room.id) return;

      if (message.type === "pollend") {
        pollOngoing();
        hasEnded();
        setResult(message.payload as RoomType["result"]);
      }
    },
    [hasEnded, pollOngoing],
  );

  useEffect(() => {
    // TODO
    ws?.addEventListener("message", onMessage);
    return () => ws?.removeEventListener("message", onMessage);
  }, [ws]);

  useEffect(() => {
    getMe();
  }, [getMe]);

  useEffect(() => {
    if (room.nicknames)
      setOrganizedChats(
        room.nicknames
          .filter((nickname) => nickname.name !== me?.nickname.name)
          .map(
            (
              nickname: NicknameType,
            ): {
              nickname: NicknameType;
              chats: string[];
            } => ({
              nickname,
              chats: room.chats
                .filter((c) => c.nickname.name === nickname.name)
                .map((c) => c.message),
            }),
          ),
      );
  }, [me?.nickname.name, room]);

  const isAnswerComplete = (() => {
    if (!answer) {
      return false;
    }

    if (answer.every((a) => a.isAI === false)) {
      return false;
    }

    const names = new Set(
      answer.map((a) => a.name).filter((item) => item !== undefined),
    );

    return names.size === room.users.length - 1;
  })();

  const description = (() => {
    if (!answer) {
      return "어떤 닉네임이 누구인지 선택해주세요.";
    }

    if (answer.every((a) => a.isAI === false)) {
      return "모든 선택이 정확한지 확인해주세요.";
    }

    const names = new Set(
      answer.map((a) => a.name).filter((item) => item !== undefined),
    );

    if (names.size !== room.users.length - 1) {
      return "모든 선택이 정확한지 확인해주세요.";
    }

    return "모든 선택이 완료되었습니다. 이대로 제출할까요?";
  })();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const answerForm = answer?.map((a) => ({
        nickname: a.nickname,
        id: room.users.find((u) => u.username === a.name)?.id,
      }));

      const res = (await (
        await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/room/${room.id}/poll`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: me?.id,
              answers: answerForm,
            }),
          },
        )
      ).json()) as Response;

      setResponse(res);
      setWaiting(true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Header text={`${getAdmin(room)?.username}님이 연 극락 퀴즈쇼`} />
      <div className="flex-grow">
        <div className="flex h-full flex-grow flex-col gap-4 p-4 pb-28 pt-16">
          {organizedChats.map((organizedChat) => (
            <Option
              key={organizedChat.nickname.name}
              nickname={organizedChat.nickname}
              chats={organizedChat.chats}
              options={room.users
                .filter((u) => u.id !== me?.id)
                .map((u) => u.username)}
              answer={answer}
              setAnswer={setAnswer}
              memos={memos}
            />
          ))}
        </div>
        <BottomSheet>
          <div className="flex flex-grow flex-col items-center gap-2">
            <span className="text-sm font-semibold text-neutral">
              {description}
            </span>
            <button
              className="btn btn-primary w-full"
              disabled={!isAnswerComplete || loading || waiting}
              onClick={async () => {
                handleSubmit();

                if (response) {
                  hasEnded();
                  pollOngoing();
                }
              }}
            >
              {waiting ? (
                "다른 사람들을 기다리고 있어요."
              ) : loading ? (
                <div className="loading" />
              ) : (
                "이대로 제출"
              )}
            </button>
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
