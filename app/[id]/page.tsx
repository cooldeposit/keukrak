import { BottomSheet } from "@/app/components/BottomSheet";
import { Header } from "@/app/components/Header";

export default function RoomPage() {
  return (
    <div className="flex h-full flex-col">
      <Header text="찬휘님이 연 극락 퀴즈쇼" />
      <BottomSheet>
        <div className="flex flex-grow flex-col items-center gap-2">
          <span className="text-sm font-semibold text-neutral">
            모두 들어왔으면 극락 퀴즈쇼를 시작해주세요.
          </span>
          <button className="btn btn-primary w-full">시작</button>
        </div>
      </BottomSheet>
    </div>
  );
}
