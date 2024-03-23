import { BottomSheet } from "@/app/components/BottomSheet";
import StartInput from "./StartInput";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-grow flex-col items-center justify-center gap-4 p-4 pb-28">
        <h1 className="text-center text-3xl font-bold text-primary">
          극락 퀴즈쇼
        </h1>
        <div>
          당신은 당신의 친구들을 정말 사랑하시나요? 당신의 친구를 정말 찾을 수
          있나요? 설마 AI를 친구라고 착각하시는 건 아니죠?
        </div>
      </div>
      <BottomSheet>
        <StartInput />
      </BottomSheet>
    </div>
  );
}
