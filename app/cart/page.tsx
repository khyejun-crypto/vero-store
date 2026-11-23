"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface CartItemView {
  id: number;
  product_id: number;
  size: string;
  quantity: number;
  name: string;
  price: number;
  image_url: string | null;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("id", { ascending: false });

      if (cartError || !cartData || cartData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const productIds = cartData.map((item) => item.product_id);
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      const mergedItems: CartItemView[] = cartData.map((cartItem) => {
        const product = productsData?.find((p) => p.id === cartItem.product_id);
        return {
          id: cartItem.id,
          product_id: cartItem.product_id,
          size: cartItem.size,
          quantity: cartItem.quantity,
          name: product?.name ?? "알 수 없는 상품",
          price: product?.price ?? 0,
          image_url: product?.image_url ?? null,
        };
      });

      setItems(mergedItems);
      setLoading(false);
    };

    fetchCart();
  }, [router]);

  const handleDelete = async (cartItemId: number) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== cartItemId));
    }
  };

  // 수량 변경 함수
  const handleUpdateQuantity = async (
    cartItemId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      await handleDelete(cartItemId);
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", cartItemId);

    if (error) {
      alert("수량 변경 실패: " + error.message);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleOrder = async () => {
    if (items.length === 0 || ordering) return;

    const confirmOrder = confirm(
      `총 ${totalPrice.toLocaleString()}원을 주문하시겠습니까?`
    );
    if (!confirmOrder) return;

    setOrdering(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const orderItemsSnapshot = items.map((item) => ({
      product_id: item.product_id,
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: orderError } = await supabase.from("orders").insert({
      user_id: userData.user.id,
      items: orderItemsSnapshot,
      total_price: totalPrice,
      status: "결제완료",
    });

    if (orderError) {
      alert("주문 실패: " + orderError.message);
      setOrdering(false);
      return;
    }

    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userData.user.id);

    alert("주문이 완료되었습니다!");
    router.push("/orders");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="w-full border-b border-gray-800 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          VERO
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/orders" className="font-bold hover:text-gray-300">
            주문내역
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white font-bold">
            ← 쇼핑 계속하기
          </Link>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-8 py-12 flex-1">
        <h1 className="text-3xl font-black tracking-tight mb-8">CART</h1>

        {loading ? (
          <p className="text-gray-500">장바구니를 불러오는 중입니다...</p>
        ) : items.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-6">장바구니에 담긴 상품이 없습니다.</p>
            <Link
              href="/"
              className="bg-white text-black px-6 py-3 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-black border border-gray-800 flex items-center justify-center text-xs text-gray-600 font-bold shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "VERO"
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/products/${item.product_id}`}
                        className="text-lg font-bold hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-400 mt-1">
                        옵션: {item.size}
                      </p>
                      <p className="text-base font-black mt-2">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  {/* 수량 조절 & 삭제 버튼 */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center border border-gray-700 bg-black">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-gray-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-9 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-gray-800 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-gray-400 border border-gray-700 px-3 py-2 hover:text-white hover:border-white transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">총 주문 예상 금액</p>
                <p className="text-2xl font-black mt-1">
                  {totalPrice.toLocaleString()}원
                </p>
              </div>

              <button
                onClick={handleOrder}
                disabled={ordering}
                className="w-full sm:w-auto bg-white text-black font-black px-8 py-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {ordering ? "주문 처리 중..." : "주문하기"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}