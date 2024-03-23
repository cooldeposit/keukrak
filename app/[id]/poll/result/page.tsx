"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { Header } from "@/app/components/Header";
import { dataURLtoFile, j } from "@/app/lib/utils";
import { CheckCircle, Download, RotateCcw, Share, X } from "lucide-react";
import { josa } from "@toss/hangul";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import html2canvas from "html2canvas-pro";
import { pathToFileURL } from "url";

interface Result {
  name: string;
  nickname: string;
  type: "correct" | "wrong";
}

function Card({ nickname, name, type }: Result) {
  const nicknameJosa =
    type === "correct" ? josa(nickname, "이/가") : josa(nickname, "은/는");
  const nameJosa = josa(name, "이/가");

  return (
    <li
      className={j(
        "flex items-center gap-2 rounded-xl border-4 p-3 font-semibold",
        type === "correct"
          ? "border-green-600 bg-green-100 text-green-900"
          : "",
        type === "wrong" ? "border-red-600 bg-red-100 text-red-900" : "",
      )}
    >
      {type === "correct" ? <CheckCircle /> : <X />}
      <span>
        {nicknameJosa} {nameJosa}{" "}
        {type === "correct" ? "맞았어요." : "아니었어요."}
      </span>
    </li>
  );
}

export default function ResultPage() {
  const shareRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const supportsShare = navigator.share !== undefined;

  const handleRestartClick = () => {
    router.push("/");
  };

  const USERS = ["영헌", "현채", "찬휘"];

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
        text: `${USERS.join(", ")}과 함께한 극락 퀴즈쇼 결과를 공유합니다.\n\n`,
        url: `${window.location.origin}`,
        files: [dataURLtoFile(dataUrl, filename)],
      });
    });
  };

  return (
    <div className="flex h-full flex-col">
      <Header text="~~님이 연 극락 퀴즈쇼" />
      <div className="flex-grow">
        <div className="flex h-full flex-col gap-4 pb-28 pt-16">
          <div ref={shareRef} className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 rounded-xl bg-slate-100 p-4">
                <span className="text-lg font-semibold">당신의 점수</span>
                <span className="text-3xl font-bold text-primary">100점</span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl bg-slate-100 p-4">
                <span className="text-lg font-semibold">당신의 순위</span>
                <span className="text-3xl font-bold text-primary">1등</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              <Card name="영헌" nickname="개빡친 무지" type="correct" />
              <Card name="AI" nickname="개빡친 무지" type="wrong" />
              <Card name="현채" nickname="개빡친 무지" type="correct" />
              <Card name="찬휘" nickname="개빡친 무지" type="correct" />
            </ul>
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
                    <Share />
                    <span>이미지 공유</span>
                  </>
                ) : (
                  <>
                    <Download />
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
