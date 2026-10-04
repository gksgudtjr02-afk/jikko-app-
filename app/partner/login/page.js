"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

// Supabase 키가 아직 Vercel 환경변수에 없으면 createClient()가 즉시 에러를
// 던지는데, 이 페이지를 빌드 시점에 미리 렌더링(static prerender)하려다가
// 그 에러 때문에 빌드 자체가 실패했었음. force-dynamic으로 "미리 만들어두지
// 말고 실제 요청 올 때(런타임)만 만들어라"로 바꿔서, 키가 없어도 빌드는
// 항상 통과하게 함 — 로그인 페이지는 어차피 캐싱하면 안 되는 페이지라
// 이 설정이 기능적으로도 더 맞음.
export const dynamic = "force-dynamic";

const C = {
  page: "#EEF0F3",
  surface: "#FFFFFF",
  ink: "#16181C",
  muted: "#6B717A",
  line: "#E1E4E8",
  brand: "#17191D",
  brand2: "#23262C",
  onBrand: "#F5F3EF",
  onBrandMuted: "#A3A8B0",
  orange: "#FF6B00",
  orange2: "#FF8A2B",
  warn: "#D9381E",
  warnSoft: "#FDE7E2",
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
  app: { width: "100%", maxWidth: "460px", padding: "0 24px", paddingBottom: "40px" },
  hero: {
    margin: "0 -24px 28px",
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
  seg: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#F3F4F6",
    borderRadius: "14px",
    padding: "4px",
    gap: "4px",
    marginBottom: "18px",
  },
  segBtn: (active) => ({
    minHeight: "46px",
    borderRadius: "11px",
    fontWeight: 600,
    fontSize: "15px",
    color: active ? C.ink : C.muted,
    background: active ? C.surface : "transparent",
    border: "none",
    boxShadow: active ? "0 1px 2px rgba(20,22,26,.06),0 6px 20px rgba(20,22,26,.06)" : "none",
    cursor: "pointer",
  }),
  field: { marginBottom: "22px" },
  label: { display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" },
  input: {
    width: "100%",
    minHeight: "54px",
    borderRadius: "14px",
    border: `1.5px solid ${C.line}`,
    background: C.surface,
    padding: "0 16px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    minHeight: "56px",
    borderRadius: "16px",
    fontWeight: 700,
    fontSize: "16px",
    color: "#fff",
    background: `linear-gradient(135deg,${C.orange2},${C.orange})`,
    border: "none",
    marginTop: "6px",
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(255,107,0,.3)",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  error: {
    background: C.warnSoft,
    color: C.warn,
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "13.5px",
    marginBottom: "14px",
  },
  notice: {
    background: "#FFF0E5",
    color: C.ink,
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "13px",
    margin: "4px 0 18px",
    lineHeight: 1.6,
  },
  footLink: {
    display: "block",
    textAlign: "center",
    color: C.muted,
    fontSize: "13.5px",
    margin: "18px 0 40px",
    textDecoration: "underline",
  },
};

export default function PartnerLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("signup"); // "signup" | "signin"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && (!name.trim() || !phone.trim())) {
      setError("이름과 휴대폰 번호를 입력해주세요.");
      return;
    }
    if (!email.trim() || password.length < 6) {
      setError("이메일과 6자 이상의 비밀번호를 입력해주세요.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;

        const userId = data.user?.id;
        if (userId) {
          const { error: upsertError } = await supabase
            .from("partners")
            .upsert({ id: userId, name: name.trim(), phone: phone.trim() });
          if (upsertError) throw upsertError;
        }

        if (!data.session) {
          setError("가입 확인 이메일을 보냈어요. 메일함을 확인하고 링크를 눌러주세요.");
          setBusy(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }

      router.push("/partner.html");
      router.refresh();
    } catch (err) {
      setError(err.message === "Invalid login credentials"
        ? "이메일 또는 비밀번호가 올바르지 않아요."
        : err.message || "문제가 생겼어요. 다시 시도해주세요.");
    } finally {
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
          <p style={styles.sub}>
            {mode === "signup" ? "가입하고 호출을 받아보세요" : "다시 오신 걸 환영해요"}
          </p>
        </div>

        <div style={styles.seg}>
          <button
            type="button"
            style={styles.segBtn(mode === "signup")}
            onClick={() => { setMode("signup"); setError(""); }}
          >
            처음이에요 (가입)
          </button>
          <button
            type="button"
            style={styles.segBtn(mode === "signin")}
            onClick={() => { setMode("signin"); setError(""); }}
          >
            이미 있어요 (로그인)
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="name">이름</label>
                <input
                  id="name"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  autoComplete="name"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="phone">휴대폰 번호</label>
                <input
                  id="phone"
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </div>
            </>
          )}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>

          {mode === "signup" && (
            <p style={styles.notice}>
              <b>지금은 이메일+비밀번호로만 가입돼요.</b> 프로토타입에 있던 휴대폰 문자 인증은
              별도 SMS 서비스 연동이 필요해서 아직 실제로 동작하지 않아요 — 입력한 이름/번호는
              프로필에 저장만 되고, 문자 인증 자체는 나중에 붙일 예정이에요.
            </p>
          )}

          <button
            type="submit"
            style={{ ...styles.btn, ...(busy ? styles.btnDisabled : {}) }}
            disabled={busy}
          >
            {busy ? "처리 중..." : mode === "signup" ? "가입하기" : "로그인"}
          </button>
        </form>

        <a href="/" style={styles.footLink}>처음 화면으로</a>
      </div>
    </main>
  );
}
