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
import { useRef } from "react";
import html2canvas from "html2canvas-pro";

interface Result {
  name: string;
  nickname: string;
  type: "correct" | "wrong";
  verbose?: boolean;
}

function Card({ nickname, name, type, verbose }: Result) {
  const nicknameJosa =
    type === "correct" ? josa(nickname, "이/가") : josa(nickname, "은/는");
  const nameJosa = josa(name, "이/가");

  const text = verbose
    ? `${nicknameJosa} ${nameJosa} ${type === "correct" ? "맞았어요." : "아니었어요."}`
    : `${nickname} → ${name}`;

  return (
    <li
      className={j(
        "flex items-center gap-2 rounded-xl border-[3px] p-3 font-semibold",
        type === "correct"
          ? "border-green-500 bg-green-100 text-green-900"
          : "",
        type === "wrong" ? "border-red-500 bg-red-100 text-red-900" : "",
      )}
    >
      {type === "correct" ? (
        <CheckCircle className="flex-none" />
      ) : (
        <X className="flex-none" />
      )}
      <span>{text}</span>
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
      <Header text="~~님의 극락 퀴즈쇼" />
      <div className="flex-grow">
        <div className="flex h-full flex-col gap-4 pb-28 pt-16">
          <div
            ref={shareRef}
            className="flex -translate-y-6 flex-col gap-4 p-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 rounded-xl bg-zinc-100 p-4">
                <span className="text-lg font-semibold">당신의 점수</span>
                <span className="text-3xl font-bold text-primary">100점</span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl bg-zinc-100 p-4">
                <span className="text-lg font-semibold">당신의 순위</span>
                <span className="text-3xl font-bold text-primary">1등</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              <Card name="영헌" nickname="개빡친 무지" type="correct" verbose />
              <Card name="AI" nickname="개빡친 무지" type="wrong" verbose />
              <Card name="현채" nickname="개빡친 무지" type="correct" verbose />
              <Card name="찬휘" nickname="개빡친 무지" type="correct" verbose />
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
                <div className="flex flex-col gap-2 rounded-lg bg-zinc-300 p-4">
                  <h2 className="font-bold">현채의 생각</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <Card name="영헌" nickname="개빡친 무지" type="correct" />
                    <Card name="영헌" nickname="개빡친 무지" type="wrong" />
                    <Card name="영헌" nickname="개빡친 무지" type="correct" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-zinc-300 p-4">
                  <h2 className="font-bold">현채의 생각</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <Card name="영헌" nickname="개빡친 무지" type="correct" />
                    <Card name="영헌" nickname="개빡친 무지" type="wrong" />
                    <Card name="영헌" nickname="개빡친 무지" type="correct" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-zinc-300 p-4">
                  <h2 className="font-bold">현채의 생각</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <Card name="영헌" nickname="개빡친 무지" type="correct" />
                    <Card name="영헌" nickname="개빡친 무지" type="wrong" />
                    <Card name="영헌" nickname="개빡친 무지" type="correct" />
                  </div>
                </div>
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
