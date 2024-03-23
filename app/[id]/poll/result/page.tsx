import { BottomSheet } from "@/app/components/BottomSheet";
import { Header } from "@/app/components/Header";

export default function ResultPage() {
  return (
    <div className="flex h-full flex-col">
      <Header text="~~님이 연 극락 퀴즈쇼" />
      <div className="flex-grow">
        <div className="flex h-full flex-grow flex-col gap-4 p-4 pb-28 pt-16"></div>
      </div>
      <BottomSheet>
        <div className="flex flex-grow flex-col items-center gap-2">
          <span className="text-sm font-semibold text-neutral">
            재미있으셨나요?
          </span>
          <button className="btn btn-primary w-full">이대로 제출</button>
        </div>
      </BottomSheet>
    </div>
  );
}
