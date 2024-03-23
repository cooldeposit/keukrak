"use client";

type TimerProps = {
  nowSeconds: number;
};

const Timer = ({ nowSeconds }: TimerProps) => {
  const minutes = String(Math.floor(nowSeconds / 60)).padStart(2, "0");
  const seconds = String(nowSeconds % 60).padStart(2, "0");

  return (
    <span>
      {minutes}:{seconds}
    </span>
  );
};

export default Timer;
