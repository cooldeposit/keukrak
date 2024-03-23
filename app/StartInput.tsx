"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Response {
  roomId: string;
  userId: string;
  concept: string;
}

export default function StartInput() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleStart = async () => {
    try {
      setLoading(true);
      const res = (await (
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: username }),
        })
      ).json()) as Response;

      localStorage.setItem("userId", res.userId);
      localStorage.setItem("username", username);
      router.push(`/${res.roomId}`);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        onClick={handleStart}
        disabled={loading || !username}
      >
        {loading ? <div className="loading" /> : "시작"}
      </button>
    </div>
  );
}
