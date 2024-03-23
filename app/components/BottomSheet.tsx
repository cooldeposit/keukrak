import type { ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
}

export function BottomSheet({ children }: BottomSheetProps) {
  return (
    <div className="fixed bottom-0 mx-auto w-full max-w-lg bg-white/40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-lg">
      {children}
    </div>
  );
}
