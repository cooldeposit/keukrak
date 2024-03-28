"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Header } from "@/app/components/Header";
import { dataURLtoFile, j } from "@/app/lib/utils";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  Share,
  X,
} from "lucide-react";
import { josa } from "@toss/hangul";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import type { NicknameType, RoomType, UserType } from "@/app/types/room";
import type { Memo } from "@/app/components/Main";
import { Bubble } from "./Chat/Bubble";

interface CardProps {
  name: string;
  nickname: NicknameType;
  correct: boolean;
  verbose?: boolean;
  chats: string[];
  realName: string;
}

interface ResultProps {
  defaultRoom: RoomType;
  ws: WebSocket;
  memos: Memo[];
  result: RoomType["result"];
  organizedChats: {
    nickname: NicknameType;
    chats: string[];
  }[];
}

function Card({
  nickname,
  name,
  correct,
  verbose,
  chats,
  realName,
}: CardProps) {
  const nicknameJosa = correct
    ? josa(nickname.name, "이/가")
    : josa(nickname.name, "은/는");
  const nameJosa = josa(name, "이/가");

  const [showingChats, setShowingChats] = useState(false);

  const toggleChats = () => {
    setShowingChats((prev) => !prev);
  };

  const text = verbose
    ? `${nicknameJosa} ${nameJosa} ${correct ? "맞았어요." : "아니었어요. (정답: " + realName + ")"}`
    : `${nickname.name} → ${name}`;

  return (
    <li
      className={j(
        "list-none rounded-xl border-[3px] p-3 font-semibold",
        correct
          ? "border-green-500 bg-green-100 text-green-900"
          : "border-red-500 bg-red-100 text-red-900",
      )}
    >
      <div className="flex items-center gap-2">
        {correct ? (
          <CheckCircle className="flex-none" />
        ) : (
          <X className="flex-none" />
        )}
        <span>{text}</span>
        {chats.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={toggleChats}>
            채팅 {showingChats ? "닫기" : "열기"}
          </button>
        )}
      </div>
      {showingChats && (
        <div className="flex flex-col gap-3 rounded-md pt-3 text-black">
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
    </li>
  );
}

export default function Result({
  defaultRoom,
  result,
  organizedChats,
}: ResultProps) {
  console.log(result);

  const shareRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const supportsShare = navigator.share !== undefined;

  const handleRestartClick = () => {
    router.push("/");
  };

  const [me, setMe] = useState<(UserType & { nickname: NicknameType }) | null>(
    null,
  );

  const getMe = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || defaultRoom.users.every((user) => user.id !== userId)) {
      router.push("/");
    }
    const res: UserType & { nickname: NicknameType } = await (
      await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/me/${defaultRoom.id}/${userId}`,
      )
    ).json();
    setMe(res);
  }, [defaultRoom.id, router]);

  useEffect(() => {
    getMe();
  }, [getMe]);

  const users = defaultRoom.users.filter((user) => user.id !== me?.id);

  const handleShareClick = () => {
    if (!shareRef.current) return;

    html2canvas(shareRef.current).then((canvas) => {
      const dataUrl = canvas.toDataURL("image/png");

      const now = Date.now();
      const filename = `극락 퀴즈쇼 ${now}.png`;

      if (supportsShare === false) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        a.click();

        return;
      }

      navigator.share({
        text: `${users.join(", ")}과 함께한 극락 퀴즈쇼 결과를 공유합니다.\n\n`,
        url: `${window.location.origin}`,
        files: [dataURLtoFile(dataUrl, filename)],
      });
    });
  };

  const admin = defaultRoom.users.find((user) => user.isAdmin);

  const myScore = result.find((r) => r.userId === me?.id)?.score;

  const ranking = result
    .map((r) => ({ userId: r.userId, score: r.score }))
    .sort((a, b) => b.score - a.score);

  const myRank = ranking.findIndex((r) => r.userId === me?.id) + 1;

  const myResult = result.find((r) => r.userId === me?.id);

  const friends = myResult?.friends;

  return (
    <div className="flex h-full flex-col">
      <Header text={`${admin?.username}님의 극락 퀴즈쇼`} />
      <div className="flex-grow">
        <div className="flex h-full flex-col gap-4 pb-28 pt-16">
          <div
            ref={shareRef}
            className="flex -translate-y-6 flex-col gap-4 p-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 rounded-xl bg-zinc-100 p-4">
                <span className="text-lg font-semibold">당신의 점수</span>
                <span className="text-3xl font-bold text-primary">
                  {myScore?.toFixed(0)}점
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl bg-zinc-100 p-4">
                <span className="text-lg font-semibold">당신의 순위</span>
                <span className="text-3xl font-bold text-primary">
                  {myRank}등
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {friends?.map((friend) => (
                <Card
                  key={friend.name}
                  name={friend.name}
                  realName={friend.realName}
                  nickname={friend.nickname}
                  correct={friend.correct}
                  verbose
                  chats={
                    organizedChats.find(
                      (c) => c.nickname.name === friend.nickname.name,
                    )?.chats ?? []
                  }
                />
              ))}
            </ul>
          </div>
          <div className="-translate-y-8 p-4 pt-0">
            <details className="group collapse bg-zinc-200 p-2">
              <summary className="collapse-title !flex w-full flex-row items-center justify-between pr-4">
                <span className="w-auto font-bold text-zinc-800">
                  더 자세한 정보
                </span>
                <ChevronDown className="flex-none group-open:hidden" />
                <ChevronUp className="hidden flex-none group-open:block" />
              </summary>
              <div className="collapse-content flex flex-col gap-2 !p-2 !pt-0 text-zinc-700">
                {users.map((user) => {
                  const userResult = result.find((r) => r.userId === user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex flex-col gap-2 rounded-lg bg-zinc-300 p-4"
                    >
                      <h2 className="font-bold">{user.username}의 생각</h2>
                      <div className="flex flex-col gap-2">
                        {userResult?.friends.map((friend) => (
                          <Card
                            key={friend.name}
                            name={friend.name}
                            nickname={friend.nickname}
                            realName={friend.realName}
                            correct={friend.correct}
                            chats={[]}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          </div>
        </div>
        <BottomSheet>
          <div className="flex flex-grow flex-col items-center gap-2">
            <span className="text-sm font-semibold text-neutral">
              재미있으셨나요?
            </span>
            <div className="grid w-full grid-cols-2 gap-2">
              <button className="btn w-full" onClick={handleRestartClick}>
                <RotateCcw />
                <span>다시 시작</span>
              </button>
              <button
                className="btn btn-primary w-full"
                onClick={handleShareClick}
              >
                {supportsShare ? (
                  <>
                    <Share className="flex-none" />
                    <span>이미지 공유</span>
                  </>
                ) : (
                  <>
                    <Download className="flex-none" />
                    <span>이미지 다운로드</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
