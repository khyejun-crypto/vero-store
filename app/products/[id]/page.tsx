"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
}

const SIZES = ["S", "M", "L", "XL"];

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("L");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("상품 상세 조회 실패:", error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("로그인이 필요한 기능입니다.");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("cart_items").insert({
      user_id: userData.user.id,
      product_id: product.id,
      size: selectedSize,
      quantity: quantity,
    });

    if (error) {
      alert("장바구니 담기 실패: " + error.message);
    } else {
      const moveCart = confirm(
        "장바구니에 상품을 담았습니다! 장바구니로 이동하시겠습니까?"
      );
      if (moveCart) {
        router.push("/cart");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="w-full border-b border-gray-800 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          VERO
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/cart" className="font-bold hover:text-gray-300">
            장바구니
          </Link>
          <Link
            href="/"
            className="text-gray-300 hover:text-white font-bold"
          >
            ← 목록으로
          </Link>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-8 py-12 flex-1">
        {loading ? (
          <p className="text-gray-500">상품 정보를 불러오는 중입니다...</p>
        ) : !product ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">상품을 찾을 수 없습니다.</p>
            <Link
              href="/"
              className="bg-white text-black px-6 py-3 font-bold text-sm"
            >
              메인으로 이동
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="w-full h-96 bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 font-bold tracking-widest">
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

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs text-gray-500 font-bold tracking-widest mb-2">
                  VERO OFFICIAL
                </p>
                <h1 className="text-3xl font-black mb-3">{product.name}</h1>
                <p className="text-2xl font-black text-white">
                  {product.price.toLocaleString()}원
                </p>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed border-t border-b border-gray-800 py-5">
                {product.description || "상품 설명이 준비 중입니다."}
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  사이즈 선택
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 text-sm font-bold border transition-colors ${
                        selectedSize === size
                          ? "bg-white text-black border-white"
                          : "bg-black text-gray-300 border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  수량
                </label>
                <div className="inline-flex items-center border border-gray-700">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 font-bold hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="px-5 py-2 font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="px-4 py-2 font-bold hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-gray-400 font-bold">총 상품 금액</span>
                  <span className="text-xl font-black">
                    {(product.price * quantity).toLocaleString()}원
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-white text-black font-black py-4 hover:bg-gray-200 transition-colors"
                >
                  장바구니 담기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white p-8">
          상품 정보를 불러오는 중입니다...
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}