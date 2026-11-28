import type { Metadata } from "next";
import "./globals.css";

// 쇼핑몰의 제목과 설명을 설정하는 부분입니다. 인터넷 탭에 표시됩니다.
export const metadata: Metadata = {
  title: "VERO | WEAR YOUR VIBE",
  description: "스트릿 패션 브랜드 VERO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}