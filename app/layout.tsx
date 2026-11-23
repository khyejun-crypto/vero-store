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
        {/* 상단 네비게이션 바 (메뉴) */}
        <header className="flex justify-between items-center p-6 border-b border-gray-800">
          <div className="text-2xl font-black tracking-tighter cursor-pointer">VERO</div>
          <nav className="flex gap-8 text-sm font-bold text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">SHOP</span>
            <span className="hover:text-white cursor-pointer transition-colors">LOGIN</span>
            <span className="hover:text-white cursor-pointer transition-colors">CART (0)</span>
          </nav>
        </header>
        
        {/* 아까 만든 page.tsx 내용이 쏙 들어오는 자리입니다 */}
        {children}
      </body>
    </html>
  );
}