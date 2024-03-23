"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Bubble } from "@/app/components/Chat";
import { Header } from "@/app/components/Header";
import { j } from "@/app/lib/utils";
import { RotateCcw } from "lucide-react";
import { useState, type SetStateAction, type Dispatch, useRef } from "react";

type Answer = {
  nickname: string;
  name: string;
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
  }: {
    nickname: string;
    name: string;
  }) => {
    setAnswer((prev) => {
      if (!prev) {
        return [{ nickname, name }];
      }

      if (prev.find((item) => item.nickname === nickname)) {
        return prev.map((memo) =>
          memo.nickname === nickname ? { ...memo, name } : memo,
        );
      }

      return [...prev, { nickname, name }];
    });

    closeMenu();
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-slate-300 bg-slate-100 p-4">
      <div className="flex w-full flex-row flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-600">
        <div className="flex flex-col peer-checked:bg-red-300">
          <h2 className="text-lg font-semibold text-slate-800">{nickname}</h2>
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
                  <span>{guess.name}</span>
                  <RotateCcw size={20} />
                </>
              ) : (
                <span>선택</span>
              )}
            </summary>
            <ul className="menu dropdown-content z-10 mr-2 w-28 rounded-xl bg-base-100 p-2 font-bold shadow">
              {options.map((name) => (
                <li key={name}>
                  <button onClick={() => handleSelectClick({ nickname, name })}>
                    {name}
                  </button>
                </li>
              ))}
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

  const USERS = ["찬휘", "영헌", "현채", "용준"];

  const isAnswerComplete = (() => {
    if (!answer) {
      return false;
    }

    if (answer.length !== DATA.length) {
      return false;
    }

    const names = new Set(answer.map((a) => a.name));

    return names.size === USERS.length;
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
          <button
            className="btn btn-primary w-full"
            disabled={!isAnswerComplete}
          >
            이대로 제출
          </button>
        </BottomSheet>
      </div>
    </div>
  );
}