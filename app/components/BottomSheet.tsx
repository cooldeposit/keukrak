import type { ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
}

export function BottomSheet({ children }: BottomSheetProps) {
  return (
    <div className="fixed bottom-0 mx-auto w-full max-w-lg bg-white/40 p-4 backdrop-blur-lg">
      {children}
    </div>
  );
}
