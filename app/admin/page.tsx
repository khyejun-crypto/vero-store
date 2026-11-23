"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// 👇 본인 관리자 이메일로 변경하세요
const ADMIN_EMAIL = "rlagpwns@gg.com";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
}

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // 새 상품 등록 상태
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 상품 수정 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchProducts = async () => {
    setProductsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("상품 목록 불러오기 실패:", error.message);
    } else if (data) {
      setProducts(data);
    }
    setProductsLoading(false);
  };

  useEffect(() => {
    const initAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      setUserEmail(email);
      setAuthLoading(false);

      if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        await fetchProducts();
      }
    };

    initAdmin();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim() || !price.trim()) {
      alert("상품명과 가격은 필수입니다.");
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      alert("올바른 가격을 입력해 주세요.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          alert("이미지 업로드 실패: " + uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("products").insert({
        name: name.trim(),
        price: numericPrice,
        description: description.trim(),
        image_url: imageUrl,
      });

      if (insertError) {
        alert("상품 등록 실패: " + insertError.message);
        setSubmitting(false);
        return;
      }

      alert("새 상품이 등록되었습니다!");
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditDescription(product.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditDescription("");
  };

  const handleUpdateProduct = async (id: number) => {
    const numericPrice = Number(editPrice);
    if (!editName.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      alert("상품명과 올바른 가격을 입력해 주세요.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: editName.trim(),
        price: numericPrice,
        description: editDescription.trim(),
      })
      .eq("id", id);

    if (error) {
      alert("상품 수정 실패: " + error.message);
      return;
    }

    alert("상품 정보가 수정되었습니다.");
    setEditingId(null);
    await fetchProducts();
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `"${product.name}" 상품을 정말 삭제할까요?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert("상품 삭제 실패: " + error.message);
      return;
    }

    alert("상품이 삭제되었습니다.");
    await fetchProducts();
  };

  const isAdmin =
    !!userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 상단 바 */}
      <header className="w-full border-b border-gray-800 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          VERO
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/cart" className="font-bold hover:text-gray-300">
            장바구니
          </Link>
          <Link href="/orders" className="font-bold hover:text-gray-300">
            주문내역
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white font-bold">
            ← 메인으로
          </Link>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-8 py-12 flex-1">
        {authLoading ? (
          <p className="text-gray-400">관리자 권한을 확인하는 중입니다...</p>
        ) : !isAdmin ? (
          <div className="bg-gray-900 border border-gray-800 p-10 max-w-xl mx-auto text-center">
            <p className="text-xs text-red-400 font-bold tracking-widest mb-2">
              ACCESS DENIED
            </p>
            <h1 className="text-2xl font-black mb-4">
              관리자 전용 페이지입니다
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              {userEmail
                ? `현재 로그인된 계정(${userEmail})은 관리자 권한이 없습니다.`
                : "관리자 계정으로 먼저 로그인해 주세요."}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="bg-white text-black px-5 py-3 text-sm font-bold hover:bg-gray-200"
              >
                로그인하러 가기
              </Link>
              <Link
                href="/"
                className="border border-gray-700 px-5 py-3 text-sm font-bold hover:border-white"
              >
                메인으로
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* 왼쪽: 새 상품 등록 폼 */}
            <section className="lg:col-span-5">
              <p className="text-xs text-gray-500 font-bold tracking-widest mb-2">
                STORE MANAGEMENT
              </p>
              <h1 className="text-3xl font-black tracking-tight mb-6">
                NEW PRODUCT
              </h1>

              <form
                onSubmit={handleCreateProduct}
                className="bg-gray-900 border border-gray-800 p-6 flex flex-col gap-5"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    상품명 *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: VERO 오버핏 후드티"
                    className="w-full bg-black border border-gray-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    가격 (원) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="예: 49000"
                    className="w-full bg-black border border-gray-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    상품 설명
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="소재, 핏, 디테일 등을 입력하세요."
                    className="w-full bg-black border border-gray-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    상품 이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    className="w-full bg-black border border-gray-700 px-3 py-2.5 text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:bg-white file:text-black file:font-bold hover:file:bg-gray-200"
                  />
                  {imageFile && (
                    <p className="text-xs text-gray-400 mt-2">
                      선택된 파일: {imageFile.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 w-full bg-white text-black font-black py-3.5 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {submitting ? "업로드 및 등록 중..." : "상품 등록하기"}
                </button>
              </form>
            </section>

            {/* 오른쪽: 등록된 상품 수정/삭제 */}
            <section className="lg:col-span-7">
              <p className="text-xs text-gray-500 font-bold tracking-widest mb-2">
                CATALOG LIST
              </p>
              <h2 className="text-2xl font-black tracking-tight mb-6">
                REGISTERED PRODUCTS ({products.length})
              </h2>

              {productsLoading ? (
                <p className="text-gray-500">상품 목록을 불러오는 중...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500">등록된 상품이 없습니다.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {products.map((product) => {
                    const isEditing = editingId === product.id;

                    return (
                      <div
                        key={product.id}
                        className="bg-gray-900 border border-gray-800 p-5"
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-black border border-gray-700 px-3 py-2 text-sm text-white"
                            />
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full bg-black border border-gray-700 px-3 py-2 text-sm text-white"
                            />
                            <textarea
                              rows={2}
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              className="w-full bg-black border border-gray-700 px-3 py-2 text-sm text-white"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleUpdateProduct(product.id)}
                                className="bg-white text-black px-4 py-2 text-xs font-black hover:bg-gray-200"
                              >
                                저장
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="border border-gray-700 px-4 py-2 text-xs font-bold hover:border-white"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-black border border-gray-800 shrink-0 overflow-hidden flex items-center justify-center text-[10px] text-gray-500">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  "NO IMG"
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-bold">
                                  #{product.id}
                                </p>
                                <h3 className="font-bold text-base">
                                  {product.name}
                                </h3>
                                <p className="text-sm font-black text-gray-200 mt-0.5">
                                  {product.price.toLocaleString()}원
                                </p>
                                {product.description && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => startEdit(product)}
                                className="border border-gray-700 px-3 py-1.5 text-xs font-bold hover:border-white"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                className="border border-red-900/70 text-red-400 px-3 py-1.5 text-xs font-bold hover:bg-red-950/60"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}