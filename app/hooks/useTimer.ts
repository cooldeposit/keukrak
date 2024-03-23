import { useEffect, useState } from "react";

const useTimer = (options: { initialSeconds: number; repeat: number }) => {
  const { initialSeconds, repeat } = options;

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [nowSeconds, setNowSeconds] = useState<number>(initialSeconds);
  const [repeatCount, setRepeatCount] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  const startTimer = () => {
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setNowSeconds((prevSecond) => {
        if (prevSecond === 0) {
          if (repeatCount < repeat) {
            setRepeatCount((repeatCount) => repeatCount + 1);
            return initialSeconds;
          } else {
            clearInterval(interval);
            setIsDone(true);
            return prevSecond;
          }
        } else {
          return prevSecond - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nowSeconds, isRunning]);

  return { startTimer, nowSeconds, isDone };
};

export default useTimer;
