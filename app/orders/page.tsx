"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface OrderItem {
  product_id: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  created_at: string;
  items: OrderItem[];
  total_price: number;
  status: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("id", { ascending: false });

      if (error) {
        console.error("주문 내역 조회 실패:", error.message);
      } else if (data) {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [router]);

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
          <Link href="/" className="text-gray-300 hover:text-white font-bold">
            ← 메인으로
          </Link>
        </div>
      </header>

      {/* 주문 내역 본문 */}
      <main className="w-full max-w-4xl mx-auto px-8 py-12 flex-1">
        <h1 className="text-3xl font-black tracking-tight mb-8">ORDERS</h1>

        {loading ? (
          <p className="text-gray-500">주문 내역을 불러오는 중입니다...</p>
        ) : orders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-6">아직 주문한 내역이 없습니다.</p>
            <Link
              href="/"
              className="bg-white text-black px-6 py-3 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-900 border border-gray-800 p-6 flex flex-col gap-4"
              >
                {/* 주문 헤더 */}
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <div>
                    <span className="text-xs text-gray-400 font-bold">
                      주문번호 #{order.id}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <span className="bg-white text-black text-xs font-black px-3 py-1">
                    {order.status}
                  </span>
                </div>

                {/* 주문한 상품 리스트 */}
                <div className="flex flex-col gap-3">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-gray-400 ml-2">
                          ({item.size} / {item.quantity}개)
                        </span>
                      </div>
                      <span className="font-bold">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>

                {/* 총 결제 금액 */}
                <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-bold">
                    총 결제 금액
                  </span>
                  <span className="text-xl font-black">
                    {order.total_price.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}