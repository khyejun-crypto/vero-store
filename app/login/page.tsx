"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase"; // 무전기 불러오기

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    // Supabase에 로그인 요청을 보냅니다.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("로그인 실패: " + error.message);
    } else {
      alert("환영합니다! 로그인이 성공적으로 완료되었습니다.");
      window.location.href = "/"; // 메인 페이지로 이동
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-gray-900 p-8 border border-gray-800">
        <h1 className="text-3xl font-black mb-8 text-center tracking-tighter">SIGN IN</h1>
        
        <div className="flex flex-col gap-4">
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
            <label className="block text-sm font-bold text-gray-400 mb-2">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-white text-black font-bold py-4 mt-4 hover:bg-gray-200 transition-colors"
          >
            로그인
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          아직 VERO 계정이 없으신가요? 
          <Link href="/signup" className="text-white font-bold ml-2 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}