"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { j } from "@/app/lib/utils";
import { Check, ClipboardList, Share } from "lucide-react";
import { useState } from "react";

interface PendingProps {
  users: string[];
  me: string;
  adminName: string;
}

export function Pending({ users, me, adminName }: PendingProps) {
  const url = window.location.href;

  const handleCopyClick = () => {
    navigator.clipboard.writeText(url);
    setClicked(true);
  };

  const handleShareClick = () => {
    navigator.share({
      url,
      text: `${adminName}님이 연 극락 퀴즈쇼에 함께해주세요! ${me}님도 참여하고 있어요.\n\n`,
    });
  };

  const [clicked, setClicked] = useState(false);

  const isAdmin = me === adminName;

  return (
    <div className="flex-grow">
      <div
        className={j(
          "flex h-full flex-grow flex-col justify-between p-4 pt-16",
          isAdmin ? "pb-28" : "",
        )}
      >
        <div className="flex flex-wrap justify-between gap-4 rounded-xl border border-slate-200 bg-slate-100 p-4 text-slate-800">
          <div className="flex flex-col gap-1 overflow-x-auto">
            <span className="font-bold">{url}</span>
            <div className="text-sm font-semibold text-slate-500">
              친구들이 이 링크로 접속하면 함께 참여할 수 있어요.
            </div>
          </div>
          <div className="ml-auto flex flex-wrap justify-end gap-2">
            <button
              className="btn btn-primary"
              onClick={handleCopyClick}
              disabled={clicked}
            >
              {clicked ? (
                <>
                  <Check />
                  <span>링크 복사됨</span>
                </>
              ) : (
                <>
                  <ClipboardList />
                  <span>링크 복사</span>
                </>
              )}
            </button>
            {typeof navigator.share === "function" && (
              <button className="btn" onClick={handleShareClick}>
                <Share />
                <span>링크 공유</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-center font-medium text-neutral">
            입장한 사람
          </div>
          <div className="grid grid-cols-3 gap-2">
            {users.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-lg border-4 border-slate-200 bg-slate-100 p-2 text-center font-semibold text-slate-700"
              >
                {name === me ? "나" : name}
                {name === adminName && " (방장)"}
              </div>
            ))}
            {users.length !== 1 && (
              <div className="bg-ai rounded-lg p-1 text-center font-semibold text-neutral shadow-sm">
                <div className="rounded-md bg-neutral-800 p-2 text-center font-semibold text-neutral-50 shadow-md">
                  … 그리고 AI
                </div>
              </div>
            )}
          </div>
          {isAdmin === false && (
            <div className="mt-2 animate-pulse text-center font-semibold text-neutral">
              방장({adminName}님)이 시작하기를 기다리고 있어요…
            </div>
          )}
        </div>
      </div>
      {isAdmin && (
        <BottomSheet>
          <div className="flex flex-grow flex-col items-center gap-2">
            <span className="text-sm font-semibold text-neutral">
              {users.length === 1
                ? "아직 들어온 사람이 없어요. 링크를 친구들에게 보내보세요."
                : "모두 들어왔으면 극락 퀴즈쇼를 시작해주세요."}
            </span>
            <button
              className="btn btn-primary w-full"
              disabled={users.length === 1}
            >
              시작
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
