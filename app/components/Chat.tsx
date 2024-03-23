"use client";

import { BottomSheet } from "@/app/components/BottomSheet";
import { j } from "@/app/lib/utils";
import type { RequireAtLeastOne } from "@/app/types/util";
import { RotateCcw } from "lucide-react";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";

type BubbleProps = {
  text: string;
  memos: Memo[];
  setMemos: Dispatch<SetStateAction<Memo[]>>;
} & RequireAtLeastOne<{
  nickname: string;
  isMine: true;
}>;

type Memo = {
  nickname: string;
  name: string;
};

const MODERATOR = "사회자";

function Bubble({ nickname, text, isMine, memos, setMemos }: BubbleProps) {
  const detailRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (detailRef.current) {
      detailRef.current.open = false;
    }
  };

  const handleMemoClick = ({ nickname, name }: Memo) => {
    setMemos((prev) => {
      if (prev.find((memo) => memo.nickname === nickname)) {
        return prev.map((memo) =>
          memo.nickname === nickname ? { ...memo, name } : memo,
        );
      }

      return [...prev, { nickname, name }];
    });

    closeMenu();
  };

  const handleRemoveMemoClick = () => {
    setMemos((prev) => prev.filter((memo) => memo.nickname !== nickname));

    closeMenu();
  };

  const guess = memos.find((memo) => memo.nickname === nickname);

  const users = ["찬휘", "희찬"];

  return (
    <div className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
      {!isMine && (
        <div className="chat-header flex items-center gap-1">
          <div className="mb-1 ml-0.5 text-sm font-medium">{nickname}</div>
          {nickname !== MODERATOR && (
            <details className="dropdown dropdown-bottom" ref={detailRef}>
              <summary className="btn btn-xs mb-1 flex items-center gap-1">
                {guess ? (
                  <>
                    <span>{guess.name}</span>
                    <RotateCcw size={16} />
                  </>
                ) : (
                  <span>메모</span>
                )}
              </summary>
              <ul className="menu dropdown-content z-10 w-28 rounded-xl bg-base-100 p-2 font-bold shadow">
                {users.map((name) => (
                  <li key={name}>
                    <button onClick={() => handleMemoClick({ nickname, name })}>
                      {name}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={handleRemoveMemoClick}>메모 삭제</button>
                </li>
              </ul>
            </details>
          )}
        </div>
      )}
      <div
        className={j(
          "chat-bubble pt-2.5",
          nickname === MODERATOR ? "bg-amber-500 text-white" : "",
          isMine ? "bg-primary text-white" : "bg-slate-200 text-slate-800",
        )}
      >
        {text}
      </div>
    </div>
  );
}

export function Chat() {
  const [memos, setMemos] = useState<Memo[]>([]);

  return (
    <div className="flex-grow">
      <div className="flex h-full flex-grow flex-col gap-3 p-4 pb-28 pt-16">
        <Bubble isMine text="안녕하세요?" memos={memos} setMemos={setMemos} />
        <Bubble
          nickname="개빡친 라이언"
          text="안녕하세요?"
          memos={memos}
          setMemos={setMemos}
        />
        <Bubble
          nickname="사회자"
          text="안녕하세요?"
          memos={memos}
          setMemos={setMemos}
        />
        <Bubble isMine text="안녕하세요?" memos={memos} setMemos={setMemos} />
        <Bubble
          nickname="뿡뿡이"
          text="안녕하세요?"
          memos={memos}
          setMemos={setMemos}
        />
        <Bubble
          nickname="개빡친 라이언"
          text="안녕하세요?"
          memos={memos}
          setMemos={setMemos}
        />
      </div>
      <BottomSheet>
        <div className="flex w-full items-end gap-2">
          <div className="flex flex-grow flex-col gap-1">
            <span className="text-medium ml-1 text-sm font-semibold text-neutral">
              보낼 메시지
            </span>
            <input
              placeholder="안녕하세요?"
              type="text"
              className="input input-bordered flex-grow"
            />
          </div>
          <button className="btn btn-primary">전송</button>
        </div>
      </BottomSheet>
    </div>
  );
}
