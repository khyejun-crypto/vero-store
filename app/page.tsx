"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
}

const MAIN_TABS = ["Home", "New Arrivals", "Tops"];
const MORE_TABS = ["Pants", "Bag"];

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<string>("Home");
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [likedIds, setLikedIds] = useState<number[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserEmail(data.user.email ?? null);
      }
    };

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("상품 불러오기 실패:", error.message);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    checkUser();
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    alert("로그아웃 되었습니다.");
  };

  const toggleLike = (id: number) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 검색어 및 탭 필터링 (현재 DB에 category 컬럼이 없으므로 키워드/전체 기준 유연하게 동작)
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "Home" || activeTab === "New Arrivals" || activeTab === "Secret Offer") {
      return true;
    }

    // Tops, Pants, Bag 선택 시 상품명/설명에 관련 키워드가 있으면 우선 필터링, 없으면 전체 노출
    const keywordMap: Record<string, string[]> = {
      Tops: ["top", "shirt", "tee", "hoodie", "sweat", "knit", "jacket", "blazer", "상의", "티셔츠", "후드", "니트", "자켓", "맨투맨"],
      Pants: ["pant", "denim", "jean", "trouser", "slack", "short", "하의", "팬츠", "데님", "바지", "슬랙스"],
      Bag: ["bag", "tote", "cross", "backpack", "pouch", "가방", "백", "토트"],
    };

    const keywords = keywordMap[activeTab] || [];
    const targetText = `${product.name} ${product.description ?? ""}`.toLowerCase();
    const hasAnyCategoryMatch = products.some((p) =>
      keywords.some((kw) => `${p.name} ${p.description ?? ""}`.toLowerCase().includes(kw))
    );

    if (!hasAnyCategoryMatch) return true;
    return keywords.some((kw) => targetText.includes(kw));
  });

  const sectionTitle =
    activeTab === "Home" ? "All Collection" : activeTab;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 상단 통합 내비게이션 바 (아임웹 에디토리얼 레이아웃 + 다크 테마) */}
      <header className="sticky top-0 z-30 w-full bg-black/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          {/* 좌측: 로고 + 카테고리 메뉴 */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              onClick={() => {
                setActiveTab("Home");
                setSearchQuery("");
              }}
              className="text-2xl font-black tracking-tighter text-white"
            >
              VERO
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {MAIN_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMoreOpen(false);
                  }}
                  className={`transition-colors cursor-pointer ${
                    activeTab === tab
                      ? "text-white font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}

              {/* 더보기(...) 드롭다운 메뉴 */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen((prev) => !prev)}
                  className={`px-1.5 py-1 transition-colors cursor-pointer ${
                    MORE_TABS.includes(activeTab)
                      ? "text-white font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  aria-label="카테고리 더보기"
                >
                  •••
                </button>

                {moreOpen && (
                  <div
                    onMouseLeave={() => setMoreOpen(false)}
                    className="absolute left-0 mt-3 w-36 bg-zinc-950 border border-zinc-800 rounded-md shadow-2xl py-1.5 z-40"
                  >
                    {MORE_TABS.map((subTab) => (
                      <button
                        key={subTab}
                        onClick={() => {
                          setActiveTab(subTab);
                          setMoreOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                          activeTab === subTab
                            ? "text-white font-bold bg-zinc-900"
                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        {subTab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 강조 프로모션 메뉴 */}
              <button
                onClick={() => {
                  setActiveTab("Secret Offer");
                  setMoreOpen(false);
                }}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "Secret Offer"
                    ? "text-rose-400 font-bold"
                    : "text-rose-500 hover:text-rose-400 font-semibold"
                }`}
              >
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-black text-[10px] font-black">
                  %
                </span>
                Secret Offer
              </button>
            </nav>
          </div>

          {/* 우측: 밑줄형 검색창 + 회원/장바구니 메뉴 */}
          <div className="flex items-center gap-6">
            {/* 검색 인풋 */}
            <div className="hidden sm:flex items-center border-b border-zinc-600 focus-within:border-white pb-1 w-48 lg:w-60 transition-colors">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="상품을 검색해보세요"
                className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-400 hover:text-white text-xs ml-1 cursor-pointer"
                >
                  ✕
                </button>
              ) : (
                <svg
                  className="w-4 h-4 text-zinc-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
              )}
            </div>

            {/* 유저 네비게이션 */}
            <div className="flex items-center gap-4 text-xs md:text-sm text-zinc-300">
              <Link
                href="/admin"
                className="hover:text-white transition-colors"
              >
                상품등록
              </Link>

              {userEmail ? (
                <>
                  <Link
                    href="/orders"
                    className="hover:text-white transition-colors"
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/cart"
                    className="hover:text-white transition-colors"
                  >
                    장바구니
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="hover:text-white transition-colors"
                  >
                    회원가입
                  </Link>
                  <Link
                    href="/orders"
                    className="hidden lg:inline hover:text-white transition-colors"
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/cart"
                    className="hover:text-white transition-colors"
                  >
                    장바구니
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 카테고리 / 섹션 타이틀 헤더 바 */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 pt-8 pb-4">
        <div className="border-b border-zinc-800 pb-3 flex items-baseline justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {sectionTitle}
          </h1>
          <span className="text-xs text-zinc-500">
            WEAR YOUR VIBE. · {filteredProducts.length} ITEMS
          </span>
        </div>
      </section>

      {/* 4열 상품 그리드 섹션 */}
      <main className="w-full max-w-[1440px] mx-auto px-6 md:px-10 pt-4 pb-20 flex-1">
        {loading ? (
          <div className="py-24 text-center text-sm text-zinc-500">
            상품을 불러오는 중입니다...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center text-sm text-zinc-500">
            조건에 맞는 상품이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {filteredProducts.map((product) => {
              const isLiked = likedIds.includes(product.id);
              return (
                <div key={product.id} className="group flex flex-col">
                  {/* 상품 이미지 박스 */}
                  <Link
                    href={`/products/${product.id}`}
                    className="relative w-full aspect-[4/5] bg-zinc-900 rounded-md overflow-hidden mb-3.5 flex items-center justify-center border border-zinc-800/80"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs text-zinc-600 font-bold tracking-widest">
                        VERO ARCHIVE
                      </span>
                    )}
                  </Link>

                  {/* 상품명 & 가격 정보 */}
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 flex flex-col"
                  >
                    <h2 className="text-sm font-medium text-zinc-100 group-hover:underline line-clamp-1 mb-1">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="text-xs text-zinc-500 line-clamp-1 mb-1.5">
                        {product.description}
                      </p>
                    )}
                    <p className="text-sm font-bold text-white mb-3">
                      {product.price.toLocaleString()}원
                    </p>
                  </Link>

                  {/* 하단 액션 버튼 (♡ 찜하기 + 담기) */}
                  <div className="flex items-center gap-1.5 mt-auto">
                    <button
                      type="button"
                      onClick={() => toggleLike(product.id)}
                      aria-label="찜하기"
                      className={`w-9 h-9 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isLiked
                          ? "border-rose-500 text-rose-500 bg-rose-500/10"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-400 hover:text-white"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.5s-7-4.5-9-9.2C1.4 7.6 4.2 4.5 7.5 4.5c2 0 3.7 1.1 4.5 2.7.8-1.6 2.5-2.7 4.5-2.7 3.3 0 6.1 3.1 4.5 6.8-2 4.7-9 9.2-9 9.2z"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="flex-1 h-9 rounded border border-zinc-700 hover:border-white hover:bg-white hover:text-black text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7h12l1 13H5L6 7z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 7V5a3 3 0 016 0v2"
                        />
                      </svg>
                      담기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}