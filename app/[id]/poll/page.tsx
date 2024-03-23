"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Bubble } from "@/app/components/Chat";
import { Header } from "@/app/components/Header";
import { RotateCcw } from "lucide-react";
import { useState, type SetStateAction, type Dispatch, useRef } from "react";

type Answer = {
  nickname: string;
  isAI: boolean;
  name?: string;
}[];

interface OptionProps {
  nickname: string;
  chats: string[];
  options: string[];
  answer: Answer | null;
  setAnswer: Dispatch<SetStateAction<Answer | null>>;
}

function Option({ nickname, chats, options, answer, setAnswer }: OptionProps) {
  const [showingChats, setShowingChats] = useState(false);

  const toggleChats = () => setShowingChats((prev) => !prev);

  const guess = answer?.find((a) => a.nickname === nickname);

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
        return prev.map((memo) =>
          memo.nickname === nickname ? { ...memo, name, isAI } : memo,
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
          <h2 className="text-lg font-semibold text-zinc-800">{nickname}</h2>
          <p>메모 안 함 | 현재 1표</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={toggleChats}>
            채팅 {showingChats ? "닫기" : "열기"}
          </button>
          <details className="dropdown dropdown-left" ref={detailRef}>
            <summary className="btn btn-primary flex items-center gap-2">
              {guess ? (
                <>
                  <span>{guess.name ?? "AI"}</span>
                  <RotateCcw size={20} className="flex-none" />
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
                      handleSelectClick({ nickname, name, isAI: false })
                    }
                  >
                    {name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleSelectClick({ nickname, isAI: true })}
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
            <Bubble key={index} nickname={nickname} text={chat} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  const [answer, setAnswer] = useState<Answer | null>(null);

  const DATA = [
    {
      nickname: "개빡친 무지",
      chats: ["ㅁㄴㅇㄹ", "ㄹㅇㄴㅁ"],
    },
    {
      nickname: "개빡친 라이언",
      chats: ["ㅁㄴㅇㄹ", "ㄹㅇㄴㅁ"],
    },
    {
      nickname: "개빡친 영헌",
      chats: ["ㅁㄴㅇㄹ", "ㄹㅇㄴㅁ"],
    },
    {
      nickname: "개빡친 어피치",
      chats: ["ㅁㄴㅇㄹ", "ㄹㅇㄴㅁ"],
    },
  ];

  const USERS = ["영헌", "현채", "용준"]; // 내 이름은 빠져야 함

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

    return names.size === USERS.length;
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

    if (names.size !== USERS.length) {
      return "모든 선택이 정확한지 확인해주세요.";
    }

    return "모든 선택이 완료되었습니다.";
  })();

  return (
    <div className="flex h-full flex-col">
      <Header text="~~님이 연 극락 퀴즈쇼" />
      <div className="flex-grow">
        <div className="flex h-full flex-grow flex-col gap-4 p-4 pb-28 pt-16">
          {DATA.map((user) => (
            <Option
              key={user.nickname}
              nickname={user.nickname}
              chats={user.chats}
              options={USERS}
              answer={answer}
              setAnswer={setAnswer}
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
              disabled={!isAnswerComplete}
            >
              이대로 제출
            </button>
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
