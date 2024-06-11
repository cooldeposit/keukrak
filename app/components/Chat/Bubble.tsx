import { NicknameType } from "@/app/types/room";
import { RotateCcw } from "lucide-react";
import { Dispatch, SetStateAction, useRef } from "react";
import { Memo } from "../Main";
import { j } from "@/app/lib/utils";

type BubbleProps = {
  text: string;
  memos?: Memo[];
  setMemos?: Dispatch<SetStateAction<Memo[]>>;
  isMine: boolean;
  nickname: NicknameType;
  users?: string[];
};

export const MODERATOR = "사회자";

export function Bubble({
  nickname,
  text,
  isMine,
  memos,
  setMemos,
  users,
}: BubbleProps) {
  const detailRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (detailRef.current) {
      detailRef.current.open = false;
    }
  };

  const handleMemoClick = ({ nickname, name, isAI }: Memo) => {
    if (!setMemos) {
      return;
    }

    setMemos((prev) => {
      if (prev.find((memo) => memo.nickname === nickname)) {
        return prev.map((memo) =>
          memo.nickname === nickname ? { ...memo, name, isAI } : memo,
        );
      }

      return [...prev, { nickname, name, isAI }];
    });

    closeMenu();
  };

  const handleRemoveMemoClick = () => {
    if (!setMemos) {
      return;
    }

    setMemos((prev) => prev.filter((memo) => memo.nickname !== nickname?.name));

    closeMenu();
  };

  const guess =
    memos === undefined
      ? undefined
      : memos.find((memo) => memo.nickname === nickname?.name);

  return (
    <div className={`chat ${isMine ? "chat-end" : "chat-start"} flex flex-col`}>
      <div
        className={`chat-header ${isMine ? "mr-12" : "ml-12"} flex items-center gap-1`}
      >
        <div className="mb-1 ml-0.5 whitespace-nowrap text-sm font-medium">
          {nickname.name}
        </div>
        {!isMine && (
          <>
            {nickname.name !== MODERATOR && memos && setMemos && users && (
              <details className="dropdown dropdown-bottom" ref={detailRef}>
                <summary className="btn btn-xs mb-1 flex items-center gap-1">
                  {guess ? (
                    <>
                      <span>{guess.name ?? "AI"}</span>
                      <RotateCcw size={12} className="flex-none" />
                    </>
                  ) : (
                    <span>메모</span>
                  )}
                </summary>
                <ul className="menu dropdown-content z-10 w-28 rounded-xl bg-base-100 p-2 font-bold shadow">
                  {users.map((name) => (
                    <li key={name}>
                      <button
                        onClick={() =>
                          handleMemoClick({
                            nickname: nickname.name,
                            name,
                            isAI: false,
                          })
                        }
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() =>
                        handleMemoClick({ nickname: nickname.name, isAI: true })
                      }
                    >
                      AI
                    </button>
                  </li>
                  <li>
                    <button onClick={handleRemoveMemoClick}>메모 삭제</button>
                  </li>
                </ul>
              </details>
            )}
          </>
        )}
      </div>
      <div
        className={j("flex items-end gap-4", isMine ? "flex-row-reverse" : "")}
      >
        <div
          className="flex size-8 flex-none items-center justify-center rounded-full"
          style={{
            backgroundColor: nickname.color,
          }}
        >
          <span className="text-xs font-bold">{nickname.icon}</span>
        </div>
        <div
          className={j(
            "chat-bubble pt-2.5",
            isMine
              ? "bg-primary text-white"
              : nickname.name === MODERATOR
                ? "bg-accent text-white"
                : "bg-zinc-200 text-zinc-800",
          )}
        >
          {text.split("\n").map((line) => (
            <>
              {line}
              <br />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
