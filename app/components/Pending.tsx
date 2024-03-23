"use client";

import { useSocket } from "@/app/[id]/WSProvider";
import { BottomSheet } from "@/app/components/BottomSheet";
import { j } from "@/app/lib/utils";
import { Check, ClipboardList, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAdmin } from "../lib/getAdmin";
import { MessageType, UserPayloadType } from "../types/message";
import { RoomType } from "../types/room";

interface PendingProps {
  defaultRoom: RoomType;
}

export function Pending({ defaultRoom }: PendingProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<RoomType>(defaultRoom);

  const [clicked, setClicked] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  const { socket } = useSocket();

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${defaultRoom.id}`;
  const admin = getAdmin(room)!;
  const isAdmin = userId === admin.id;

  const router = useRouter();

  useEffect(() => {
    if (typeof localStorage === "undefined") return;

    if (localStorage.getItem("userId") !== null) {
      setUserId(localStorage.getItem("userId"));
    }
    if (localStorage.getItem("username") !== null) {
      setUsername(localStorage.getItem("username")!);
    }

    window.addEventListener("beforeunload", handleUnmount);

    return () => {
      window.removeEventListener("beforeunload", handleUnmount);
    };
  }, []);

  const handleReenter = useCallback(async () => {
    const id = localStorage.getItem("userId");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/room/${room.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: id,
        connect: true,
      }),
    });

    if (socket === null) {
      return;
    }

    socket.emit("enter", {
      type: "enter",
      id: room.id,
      payload: {
        userId: id,
        username: username,
      },
    });
    setUserId(id);
  }, [username, room]);

  useEffect(() => {
    if (room.users.some((user) => user.id === localStorage.getItem("userId"))) {
      setIsEntered(true);
      handleReenter();
    }
  }, []);

  const handleUnmount = async () => {
    if (socket === null) {
      return;
    }

    socket.emit("leave", {
      type: "leave",
      id: room.id,
      payload: {
        userId: localStorage.getItem("userId")!,
        username: localStorage.getItem("username")!,
      },
    });
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/room/${room.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        connect: false,
      }),
    });
  };

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
          `${process.env.NEXT_PUBLIC_API_URL}/api/room/${room.id}/enter`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: username }),
          },
        )
      ).json();

      if (socket === null) {
        return;
      }

      socket.emit("enter", {
        type: "enter",
        id: room.id,
        payload: {
          userId: res.userId,
          username: username,
        },
      });
      localStorage.setItem("userId", res.userId);
      localStorage.setItem("username", username!);
      setUserId(res.userId);
      setIsEntered(true);
      setRoom((room) => ({
        ...room,
        users: [
          ...room.users,
          {
            id: res.userId,
            username: username,
            isOnline: true,
            isAdmin: false,
          },
        ],
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await (
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/room/${room.id}/next`,
        )
      ).json();

      if (socket === null) {
        return;
      }

      socket.emit("start", {
        type: "start",
        id: room.id,
        payload: null,
      });

      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const onMessage = useCallback(
    async (event: MessageEvent<Blob>) => {
      const payload = await event.data.text();
      const message = JSON.parse(payload) as MessageType;

      if (message.id !== room.id) return;

      if (message.type === "enter") {
        console.log("enter", message.payload as UserPayloadType);
        setRoom((room) => {
          if (
            room.users.some(
              (user) => user.id === (message.payload as UserPayloadType).userId,
            )
          ) {
            return {
              ...room,
              users: room.users.map((user) => {
                if (user.id === (message.payload as UserPayloadType).userId) {
                  return {
                    ...user,
                    isOnline: true,
                  };
                }
                return user;
              }),
            };
          }
          return {
            ...room,
            users: [
              ...room.users,
              {
                id: (message.payload as UserPayloadType).userId,
                username: (message.payload as UserPayloadType).username,
                isOnline: true,
                isAdmin: false,
              },
            ],
          };
        });
      }

      if (message.type === "leave") {
        console.log("leave", message.payload as UserPayloadType);
        setRoom((room) => ({
          ...room,
          users: room.users.map((user) => {
            if (user.id === (message.payload as UserPayloadType).userId) {
              return {
                ...user,
                isOnline: false,
              };
            }
            return user;
          }),
        }));
      }

      if (message.type === "start") {
        router.refresh();
      }
    },
    [room.id, router],
  );

  useEffect(() => {
    if (socket === null) {
      console.log("socket is null");
      return;
    }
    console.log("socket is not null");

    socket.on("message", onMessage);

    return () => {
      socket.off("message", onMessage);
    };
  }, [onMessage, socket]);

  return (
    <div className="flex-grow">
      <div
        className={j(
          "flex h-full flex-grow flex-col justify-between p-4 pt-16",
          isAdmin ? "pb-28" : "",
        )}
      >
        <div className="flex flex-wrap justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-100 p-4 text-zinc-800">
          <div className="flex flex-col gap-1 overflow-x-auto">
            <span className="font-bold">{url}</span>
            <div className="text-sm font-semibold text-zinc-500">
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
                  <Check className="flex-none" />
                  <span>링크 복사됨</span>
                </>
              ) : (
                <>
                  <ClipboardList className="flex-none" />
                  <span>링크 복사</span>
                </>
              )}
            </button>
            {typeof navigator.share === "function" && (
              <button className="btn" onClick={handleShareClick}>
                <Share className="flex-none" />
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
                className="flex items-center justify-center rounded-lg border-4 border-zinc-200 bg-zinc-100 p-2 text-center font-semibold text-zinc-700"
              >
                <div
                  className={j(
                    "mr-2 h-2 w-2 rounded-full",
                    user.isOnline ? "bg-green-500" : "bg-zinc-400",
                  )}
                />
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
              onClick={handleStart}
            >
              시작
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
