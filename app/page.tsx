import { BottomSheet } from "@/app/components/BottomSheet";

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
        <div className="flex w-full items-end gap-2">
          <div className="flex flex-grow flex-col gap-1">
            <span className="text-medium ml-1 text-sm font-semibold text-neutral">
              당신의 이름
            </span>
            <input
              placeholder="홍길동"
              type="text"
              className="input input-bordered flex-grow"
            />
          </div>
          <button className="btn btn-primary">시작</button>
        </div>
      </BottomSheet>
    </div>
  );
}
