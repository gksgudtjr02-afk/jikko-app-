"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

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
  app: { width: "100%", maxWidth: "460px", padding: "0 32px", paddingBottom: "40px" },
  hero: {
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
  field: { width: "100%", marginBottom: "22px" },
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
    width: "100%",
    boxSizing: "border-box",
    background: C.warnSoft,
    color: C.warn,
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "13.5px",
    marginBottom: "16px",
  },
};

export default function ProfileSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 카카오 계정에 이름이 있으면 미리 채워줌 (없어도 그만).
    supabase.auth.getUser().then(({ data }) => {
      const kakaoName =
        data.user?.user_metadata?.name || data.user?.user_metadata?.full_name;
      if (kakaoName) setName(kakaoName);
    });
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("이름과 휴대폰 번호를 입력해주세요.");
      return;
    }

    setBusy(true);
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) throw new Error("로그인 정보를 찾지 못했어요. 다시 로그인해주세요.");

      const res = await fetch("/api/partner-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: name.trim(), phone: phone.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "저장에 실패했어요.");
      }

      router.push("/partner.html");
      router.refresh();
    } catch (err) {
      setError(err.message || "문제가 생겼어요. 다시 시도해주세요.");
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
          <p style={styles.h1}>마지막 한 단계예요</p>
          <p style={styles.sub}>사장님께 보여질 이름과 연락처를 알려주세요</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            style={{ ...styles.btn, ...(busy ? styles.btnDisabled : {}) }}
            disabled={busy}
          >
            {busy ? "저장 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
