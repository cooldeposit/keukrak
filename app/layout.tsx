import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "극락퀴즈쇼",
  description: "여기가 극락이다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex items-center justify-center overflow-hidden bg-gray-200">
        <div className="relative w-full max-w-lg overflow-auto bg-white shadow-xl min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
