"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const router = useRouter();

  // 단계 관리: 1 = 약관동의, 2 = 회원정보 입력
  const [step, setStep] = useState<1 | 2>(1);

  // 1단계: 약관 동의 상태
  const [agreeTerms, setAgreeTerms] = useState(false); // 이용약관 (필수)
  const [agreePrivacy, setAgreePrivacy] = useState(false); // 개인정보 수집·이용 (필수)
  const [agreeAge, setAgreeAge] = useState(false); // 만 14세 이상 (필수)
  const [agreeMarketing, setAgreeMarketing] = useState(false); // 마케팅 수신 (선택)

  const allChecked = agreeTerms && agreePrivacy && agreeAge && agreeMarketing;
  const requiredChecked = agreeTerms && agreePrivacy && agreeAge;

  const handleToggleAll = (checked: boolean) => {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeAge(checked);
    setAgreeMarketing(checked);
  };

  // 2단계: 회원 정보 입력 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 전화번호 자동 하이픈 포맷터 (010-1234-5678)
  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "").slice(0, 11);
    if (numbers.length < 4) {
      setPhone(numbers);
    } else if (numbers.length < 8) {
      setPhone(`${numbers.slice(0, 3)}-${numbers.slice(3)}`);
    } else {
      setPhone(
        `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
      );
    }
  };

  // 비밀번호 유효성 검사 (8자 이상, 영문 + 숫자 + 특수문자 포함)
  const isPasswordValid =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(
      password
    );
  const isPasswordMatch =
    password.length > 0 && password === passwordConfirm;

  // 1단계 -> 2단계 이동
  const handleNextStep = () => {
    if (!requiredChecked) {
      alert("필수 약관에 모두 동의해 주세요.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 최종 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.includes("@")) {
      alert("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    if (!isPasswordValid) {
      alert("비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.");
      return;
    }
    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (name.trim().length < 2) {
      alert("이름을 정확히 입력해 주세요.");
      return;
    }
    if (phone.replace(/-/g, "").length < 10) {
      alert("연락처를 정확히 입력해 주세요.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone,
          marketing_agreed: agreeMarketing,
        },
      },
    });

    setSubmitting(false);

    if (error) {
      alert("회원가입 실패: " + error.message);
    } else {
      alert("VERO 회원가입이 완료되었습니다! 로그인해 주세요.");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      {/* 상단 브랜드 로고 */}
      <Link
        href="/"
        className="text-2xl font-black tracking-tighter mb-8 hover:opacity-80 transition-opacity"
      >
        VERO
      </Link>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-7 sm:p-8">
        {/* 단계 표시 인디케이터 */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-6 pb-4 border-b border-zinc-800">
          <span className={step === 1 ? "text-white font-bold" : ""}>
            01. 약관동의
          </span>
          <span>—</span>
          <span className={step === 2 ? "text-white font-bold" : ""}>
            02. 정보입력
          </span>
        </div>

        {step === 1 ? (
          /* ================= 1단계: 약관 동의 ================= */
          <div>
            <h1 className="text-2xl font-bold text-center tracking-tight mb-7">
              약관동의
            </h1>

            {/* 전체 동의 체크박스 */}
            <label className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => handleToggleAll(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-white cursor-pointer"
              />
              <span className="text-sm font-semibold text-white leading-snug">
                이용약관, 개인정보 수집 및 이용에 모두 동의합니다.
              </span>
            </label>

            {/* 1. 이용약관 동의 (필수) */}
            <div className="mb-5">
              <label className="flex items-center gap-2.5 text-sm font-medium mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 accent-white cursor-pointer"
                />
                <span>
                  이용약관 동의 <span className="text-rose-400">(필수)</span>
                </span>
              </label>
              <div className="h-28 overflow-y-auto bg-black border border-zinc-800 p-3 text-xs text-zinc-400 leading-relaxed space-y-2">
                <p className="font-bold text-zinc-200">제1조 (목적)</p>
                <p>
                  본 이용약관은 VERO(이하 &quot;회사&quot;)가 운영하는 온라인
                  스토어에서 제공하는 전자상거래 관련 서비스의 이용 조건 및
                  절차, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을
                  목적으로 합니다.
                </p>
                <p className="font-bold text-zinc-200">제2조 (회원가입 및 계정)</p>
                <p>
                  이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본
                  약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
                </p>
              </div>
            </div>

            {/* 2. 개인정보 수집 및 이용 동의 (필수) */}
            <div className="mb-5">
              <label className="flex items-center gap-2.5 text-sm font-medium mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="w-4 h-4 accent-white cursor-pointer"
                />
                <span>
                  개인정보 수집 및 이용 동의{" "}
                  <span className="text-rose-400">(필수)</span>
                </span>
              </label>
              <div className="h-28 overflow-y-auto bg-black border border-zinc-800 p-3 text-xs text-zinc-400 leading-relaxed space-y-2">
                <p className="font-bold text-zinc-200">
                  1. 개인정보 수집목적 및 이용목적
                </p>
                <p>
                  (1) 홈페이지 회원 가입 및 관리: 회원제 서비스 이용에 따른
                  본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용
                  방지, 가입 의사 확인, 분쟁 조정을 위한 기록 보존
                </p>
                <p>
                  (2) 재화 또는 서비스 제공: 물품 배송, 주문 내역 조회, 맞춤형
                  서비스 제공
                </p>
                <p className="font-bold text-zinc-200">2. 수집하는 항목</p>
                <p>필수항목: 이메일, 비밀번호, 이름, 연락처</p>
              </div>
            </div>

            {/* 3. 만 14세 이상 (필수) */}
            <label className="flex items-center gap-2.5 text-sm font-medium mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeAge}
                onChange={(e) => setAgreeAge(e.target.checked)}
                className="w-4 h-4 accent-white cursor-pointer"
              />
              <span>
                만 14세 이상입니다. <span className="text-rose-400">(필수)</span>
              </span>
            </label>

            {/* 4. 마케팅 수신 동의 (선택) */}
            <label className="flex items-center gap-2.5 text-sm text-zinc-400 mb-7 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
                className="w-4 h-4 accent-white cursor-pointer"
              />
              <span>신상품 드롭 및 할인 혜택 알림 수신 동의 (선택)</span>
            </label>

            {/* 하단 취소 / 다음 버튼 */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                className="py-3.5 border border-zinc-700 text-center text-sm font-bold text-zinc-300 hover:border-white hover:text-white transition-colors"
              >
                취소
              </Link>
              <button
                type="button"
                onClick={handleNextStep}
                className={`py-3.5 text-sm font-bold transition-colors cursor-pointer ${
                  requiredChecked
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                }`}
              >
                다음 단계
              </button>
            </div>
          </div>
        ) : (
          /* ================= 2단계: 회원 정보 입력 ================= */
          <form onSubmit={handleSignup}>
            <div className="flex items-center justify-between mb-7">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                ← 약관으로
              </button>
              <h1 className="text-2xl font-bold tracking-tight">회원가입</h1>
              <span className="w-12" />
            </div>

            {/* 묶음형 계정 입력 박스 (이메일 / 비밀번호 / 비밀번호 확인) */}
            <div className="border border-zinc-700 divide-y divide-zinc-800 bg-black mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                required
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:bg-zinc-900/60"
              />
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  required
                  className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:bg-zinc-900/60 pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? "숨김" : "표시"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                required
                className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:bg-zinc-900/60"
              />
            </div>

            {/* 비밀번호 조건 및 일치 여부 안내 */}
            <div className="mb-6 space-y-1 text-xs">
              <p
                className={
                  password.length === 0
                    ? "text-zinc-500"
                    : isPasswordValid
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              >
                8자리 이상의 영문, 숫자, 특수문자를 사용해 주세요.
              </p>
              {passwordConfirm.length > 0 && (
                <p
                  className={
                    isPasswordMatch ? "text-emerald-400" : "text-rose-400"
                  }
                >
                  {isPasswordMatch
                    ? "비밀번호가 일치합니다."
                    : "비밀번호가 일치하지 않습니다."}
                </p>
              )}
            </div>

            {/* 이름 (필수) */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                이름 <span className="text-sky-400">•</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
                className="w-full bg-black border border-zinc-700 px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* 연락처 (필수) */}
            <div className="mb-7">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                연락처 <span className="text-sky-400">•</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="010-0000-0000"
                required
                className="w-full bg-black border border-zinc-700 px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* 가입하기 버튼 */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-bold py-4 text-sm hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400 transition-colors cursor-pointer"
            >
              {submitting ? "가입 처리 중..." : "가입하기"}
            </button>
          </form>
        )}

        <div className="mt-7 pt-5 border-t border-zinc-900 text-center text-xs text-zinc-500">
          이미 VERO 계정이 있으신가요?
          <Link
            href="/login"
            className="text-white font-bold ml-2 hover:underline"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}