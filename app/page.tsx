"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
}

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 상단 내비게이션 바 */}
      <header className="w-full border-b border-gray-800 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          VERO
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/admin"
            className="text-gray-300 hover:text-white font-bold transition-colors"
          >
            상품등록
          </Link>
          {userEmail ? (
            <>
              <Link
                href="/cart"
                className="text-white font-bold hover:text-gray-300 transition-colors"
              >
                장바구니
              </Link>
              <Link
                href="/orders"
                className="text-white font-bold hover:text-gray-300 transition-colors"
              >
                주문내역
              </Link>
              <span className="text-gray-400">{userEmail}님</span>
              <button
                onClick={handleLogout}
                className="border border-gray-700 px-4 py-2 font-bold hover:bg-white hover:text-black transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-300 hover:text-white font-bold transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="bg-white text-black px-4 py-2 font-bold hover:bg-gray-200 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 히어로(브랜드 타이틀) 섹션 */}
      <section className="flex flex-col items-center justify-center py-24 px-8 border-b border-gray-900">
        <h1 className="text-7xl font-black tracking-tighter mb-4">VERO</h1>
        <p className="text-2xl text-gray-400 font-bold tracking-widest">
          WEAR YOUR VIBE.
        </p>
      </section>

      {/* 상품 목록 섹션 */}
      <main className="w-full max-w-6xl mx-auto px-8 py-16 flex-1">
        <h2 className="text-xl font-black tracking-wider mb-8 text-gray-200">
          COLLECTION
        </h2>

        {loading ? (
          <p className="text-gray-500">상품을 불러오는 중입니다...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">등록된 상품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-gray-900 border border-gray-800 p-6 flex flex-col justify-between hover:border-white transition-colors block"
              >
                <div>
                  <div className="w-full h-64 bg-black border border-gray-800 mb-6 flex items-center justify-center text-gray-600 font-bold tracking-widest">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "VERO ARCHIVE"
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-lg font-black">
                    {product.price.toLocaleString()}원
                  </span>
                  <span className="text-xs text-gray-400 font-bold">
                    상세보기 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}