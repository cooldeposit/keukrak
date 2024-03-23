"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { j } from "@/app/lib/utils";
import { Check, ClipboardList, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { RoomType } from "../types/room";
import { getAdmin } from "../lib/getAdmin";

interface PendingProps {
  room: RoomType;
}

export function Pending({ room }: PendingProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const url = `https://${process.env.NEXT_PUBLIC_APP_HOST}/${room.id}`;

  const admin = getAdmin(room)!;

  useEffect(() => {
    if (typeof localStorage === "undefined") return;

    if (localStorage.getItem("userId") !== null) {
      const id = localStorage.getItem("userId");
      setUserId(id);
      setIsEntered(room.users.some((user) => user.id === id));
    }
    if (localStorage.getItem("username") !== null) {
      setUsername(localStorage.getItem("username")!);
    }
  }, []);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(url);
    setClicked(true);
  };

  const handleShareClick = () => {
    navigator.share({
      url,
      text: `${getAdmin(room)!.username}님이 연 극락 퀴즈쇼에 함께해주세요! ${username ? username + "님도 참여하고 있어요." : ""}\n\n`,
    });
  };

  const handleEnter = async () => {
    interface Response {
      userId: string;
    }
    try {
      setLoading(true);
      const res: Response = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/room/${room.id}/enter`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: username }),
          },
        )
      ).json();
      localStorage.setItem("userId", res.userId);
      localStorage.setItem("username", username!);
      setUserId(res.userId);
      setIsEntered(true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userId === admin.id;

  const [clicked, setClicked] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

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
            {room.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-center rounded-lg border-4 border-slate-200 bg-slate-100 p-2 text-center font-semibold text-slate-700"
              >
                {user.id === userId ? "나" : user.username}
                {user.id === admin.id && " (방장)"}
              </div>
            ))}
            {room.users.length !== 1 && (
              <div className="rounded-lg bg-ai p-1 text-center font-semibold text-neutral shadow-sm">
                <div className="rounded-md bg-neutral-800 p-2 text-center font-semibold text-neutral-50 shadow-md">
                  … 그리고 AI
                </div>
              </div>
            )}
          </div>
          {isAdmin === false &&
            (isEntered ? (
              <div className="mt-2 animate-pulse text-center font-semibold text-neutral">
                방장({admin.username}님)이 시작하기를 기다리고 있어요…
              </div>
            ) : (
              <div className="flex w-full items-end gap-2">
                <div className="flex flex-grow flex-col gap-1">
                  <span className="text-medium ml-1 text-sm font-semibold text-neutral">
                    당신의 이름
                  </span>
                  <input
                    placeholder="홍길동"
                    type="text"
                    className="input input-bordered flex-grow"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleEnter}
                  disabled={loading || !username}
                >
                  {loading ? <div className="loading" /> : "입장"}
                </button>
              </div>
            ))}
        </div>
      </div>
      {isAdmin && (
        <BottomSheet>
          <div className="flex flex-grow flex-col items-center gap-2">
            <span className="text-sm font-semibold text-neutral">
              {room.users.length === 1
                ? "아직 들어온 사람이 없어요. 링크를 친구들에게 보내보세요."
                : "모두 들어왔으면 극락 퀴즈쇼를 시작해주세요."}
            </span>
            <button
              className="btn btn-primary w-full"
              disabled={room.users.length === 1}
            >
              시작
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
