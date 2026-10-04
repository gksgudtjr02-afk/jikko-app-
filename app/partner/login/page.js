"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

// 키가 없어도 빌드가 항상 통과하도록 강제 동적 렌더링 — 자세한 이유는
// lib/supabaseClient.js의 주석 참고.
export const dynamic = "force-dynamic";

const C = {
  page: "#EEF0F3",
  ink: "#16181C",
  muted: "#6B717A",
  brand: "#17191D",
  brand2: "#23262C",
  onBrand: "#F5F3EF",
  onBrandMuted: "#A3A8B0",
  orange: "#FF6B00",
  warn: "#D9381E",
  warnSoft: "#FDE7E2",
  kakao: "#FEE500",
  kakaoInk: "#191600",
};

const styles = {
  wrap: {
    minHeight: "100dvh",
    background: C.page,
    color: C.ink,
    fontFamily:
      '"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  app: {
    width: "100%",
    maxWidth: "460px",
    padding: "0 32px",
    paddingBottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  hero: {
    width: "100%",
    boxSizing: "border-box",
    margin: "0 -32px 32px",
    background: `linear-gradient(180deg,${C.brand2},${C.brand})`,
    color: C.onBrand,
    padding: "34px 24px 30px",
    borderRadius: "0 0 30px 30px",
    textAlign: "center",
  },
  mark: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: '"Outfit","IBM Plex Sans KR",sans-serif',
    fontWeight: 800,
    fontSize: "26px",
  },
  lens: {
    display: "inline-block",
    width: "0.78em",
    height: "0.78em",
    borderRadius: "50%",
    border: "0.16em solid #FF6B00",
    position: "relative",
    top: "0.02em",
    marginLeft: "0.04em",
  },
  h1: { fontSize: "19px", margin: "14px 0 0", fontWeight: 700 },
  sub: { color: C.onBrandMuted, fontSize: "14px", margin: "6px 0 0" },
  kakaoBtn: {
    width: "100%",
    minHeight: "56px",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "16px",
    color: C.kakaoInk,
    background: C.kakao,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  error: {
    width: "100%",
    boxSizing: "border-box",
    background: C.warnSoft,
    color: C.warn,
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "13.5px",
    marginBottom: "16px",
  },
  notice: {
    width: "100%",
    boxSizing: "border-box",
    background: "#FFF0E5",
    color: C.ink,
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "13px",
    margin: "20px 0 0",
    lineHeight: 1.6,
  },
  footLink: {
    display: "block",
    textAlign: "center",
    color: C.muted,
    fontSize: "13.5px",
    marginTop: "24px",
    textDecoration: "underline",
  },
};

export default function PartnerLoginPage() {
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleKakaoLogin() {
    setError("");
    setBusy(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Supabase가 기본으로 account_email까지 요청하는데, 비즈 앱 전환 전이라
          // 그 항목 권한이 없어서 카카오가 KOE205로 거부함. 저희는 이메일을 아예
          // 안 쓰니(이름·번호는 가입 후 별도 입력) 동의항목에 켜둔 두 개만 요청.
          scopes: "profile_nickname profile_image",
        },
      });
      if (oauthError) throw oauthError;
      // 성공하면 브라우저가 카카오 로그인 화면으로 바로 이동함 — 여기서
      // 더 할 일 없음. 카카오 로그인이 아직 Supabase에 연동 안 돼있으면
      // 에러가 던져져서 catch로 감.
    } catch (err) {
      setError(
        err.message?.includes("Unsupported provider")
          ? "카카오 로그인이 아직 연동 준비 중이에요."
          : err.message || "문제가 생겼어요. 다시 시도해주세요."
      );
      setBusy(false);
    }
  }

  return (
    <main style={styles.wrap}>
      <div style={styles.app}>
        <div style={styles.hero}>
          <span style={styles.mark}>
            JIKK<span style={styles.lens} />
          </span>
          <p style={styles.h1}>기사님 계정으로 시작하기</p>
          <p style={styles.sub}>카카오로 간편하게 가입하고 호출을 받아보세요</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          type="button"
          style={{ ...styles.kakaoBtn, ...(busy ? styles.btnDisabled : {}) }}
          onClick={handleKakaoLogin}
          disabled={busy}
        >
          {busy ? "이동 중..." : "카카오로 시작하기"}
        </button>

        <p style={styles.notice}>
          처음 로그인하시면 이름·휴대폰 번호만 간단히 입력하는 화면이 한 번 더 떠요.
          프로토타입에 있던 휴대폰 문자 인증은 별도 SMS 서비스 연동이 필요해서 아직
          실제로 동작하지 않아요 — 입력한 번호는 프로필에 저장만 돼요.
        </p>

        <a href="/" style={styles.footLink}>처음 화면으로</a>
      </div>
    </main>
  );
}
