"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Bubble } from "@/app/components/Chat";
import { Header } from "@/app/components/Header";
import { j } from "@/app/lib/utils";
import { useState, type SetStateAction, type Dispatch } from "react";

interface OptionProps {
  nickname: string;
  chats: string[];
  selected: boolean;
  setSelectedUser: Dispatch<SetStateAction<string | null>>;
}

function Option({ nickname, chats, selected, setSelectedUser }: OptionProps) {
  const [showingChats, setShowingChats] = useState(false);

  const toggleChats = () => setShowingChats((prev) => !prev);

  const handleSelect = () => {
    setSelectedUser(nickname);
  };

  return (
    <div
      className={j(
        "flex flex-col gap-2 rounded-xl border-2 p-4",
        selected
          ? "border-blue-300 bg-blue-100"
          : "border-slate-300 bg-slate-100 ",
      )}
    >
      <div className="flex w-full flex-row flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-600">
        <div className="flex flex-col peer-checked:bg-red-300">
          <h2 className="text-lg font-semibold text-slate-800">{nickname}</h2>
          <p>메모 안 함 | 현재 1표</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={toggleChats}>
            채팅 {showingChats ? "닫기" : "열기"}
          </button>
          <button className="btn btn-primary " onClick={handleSelect}>
            선택
          </button>
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
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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
              selected={selectedUser === user.nickname}
              setSelectedUser={setSelectedUser}
            />
          ))}
        </div>
        <BottomSheet>
          <button className="btn btn-primary w-full" disabled={!selectedUser}>
            {selectedUser ? `AI는 바로 ${selectedUser}!` : "AI 결정"}
          </button>
        </BottomSheet>
      </div>
    </div>
  );
}
