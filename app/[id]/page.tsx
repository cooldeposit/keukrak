"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Header } from "@/app/components/Header";
import { j } from "@/app/lib/utils";
import { ClipboardList } from "lucide-react";
import { useState } from "react";

export default function RoomPage() {
  const USERS = ["찬휘", "희찬"];
  // const USERS = ["찬휘"];

  const ME = "찬휘";
  const ADMIN_NAME = "희찬";

  // @ts-expect-error "찬휘" "희찬"
  const IS_ADMIN = ME === ADMIN_NAME;

  const URL = "https://...";

  const handleCopyClick = () => {
    navigator.clipboard.writeText(URL);
    setClicked(true);
  };

  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <Header
        text={`${IS_ADMIN ? "내가" : `${ADMIN_NAME}님이`} 연 극락 퀴즈쇼`}
      />
      <div
        className={j(
          "flex flex-grow flex-col justify-between p-4 pt-16",
          IS_ADMIN ? "pb-28" : "",
        )}
      >
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-100 p-4 text-slate-800">
          <div className="text-sm font-bold text-slate-500">
            친구들에게 이 링크를 공유해보세요.
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold">{URL}</span>
            <button
              className="btn btn-primary"
              onClick={handleCopyClick}
              disabled={clicked}
            >
              {clicked ? (
                "복사 완료"
              ) : (
                <>
                  <ClipboardList />
                  <span>링크 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-center font-medium text-neutral">
            입장한 사람
          </div>
          <div className="grid grid-cols-3 gap-2">
            {USERS.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-lg border-4 border-slate-200 bg-slate-100 p-2 text-center font-semibold text-slate-700"
              >
                {name === ME ? "나" : name}
                {IS_ADMIN && " (방장)"}
              </div>
            ))}
            {USERS.length !== 1 && (
              <div className="bg-ai rounded-lg p-1 text-center font-semibold text-neutral shadow-sm">
                <div className="rounded-md bg-neutral-800 p-2 text-center font-semibold text-neutral-50 shadow-md">
                  … 그리고 AI
                </div>
              </div>
            )}
          </div>
          {IS_ADMIN === false && (
            <div className="mt-2 animate-pulse text-center font-semibold text-neutral">
              방장의 시작을 기다리고 있어요…
            </div>
          )}
        </div>
      </div>
      {IS_ADMIN && (
        <BottomSheet>
          <div className="flex flex-grow flex-col items-center gap-2">
            <span className="text-sm font-semibold text-neutral">
              {USERS.length === 1
                ? "아직 들어온 사람이 없어요. 링크를 친구들에게 보내보세요."
                : "모두 들어왔으면 극락 퀴즈쇼를 시작해주세요."}
            </span>
            <button
              className="btn btn-primary w-full"
              disabled={USERS.length === 1}
            >
              시작
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
