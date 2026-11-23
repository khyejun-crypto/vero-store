"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase"; // 우리가 만든 무전기 불러오기

export default function Signup() {
  // 고객이 입력한 이름, 이메일, 비밀번호를 임시로 기억해두는 공간(상태)입니다.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // [회원가입 완료] 버튼을 눌렀을 때 실행되는 진짜 가입 기능입니다.
  const handleSignup = async () => {
    // 빈칸이 있는지 먼저 확인합니다.
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    // Supabase 무전기를 통해 회원가입 정보를 전송합니다.
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { name: name } // 이름 정보도 함께 보냅니다.
      }
    });

    if (error) {
      // 가입 실패 시 (예: 이미 가입된 이메일, 비밀번호 6자리 미만 등) 에러창 띄우기
      alert("회원가입 실패: " + error.message);
    } else {
      // 가입 성공 시 알림을 띄우고 로그인 화면으로 보냅니다.
      alert("회원가입이 성공적으로 완료되었습니다! 로그인해주세요.");
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-gray-900 p-8 border border-gray-800">
        <h1 className="text-3xl font-black mb-8 text-center tracking-tighter">JOIN VERO</h1>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">이름</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동" 
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">이메일</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vero@example.com" 
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">비밀번호 (최소 6자)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* 버튼을 누르면 handleSignup 기능이 작동합니다 */}
          <button 
            onClick={handleSignup}
            className="w-full bg-white text-black font-bold py-4 mt-4 hover:bg-gray-200 transition-colors"
          >
            회원가입 완료
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          이미 VERO 계정이 있으신가요? 
          <Link href="/login" className="text-white font-bold ml-2 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}