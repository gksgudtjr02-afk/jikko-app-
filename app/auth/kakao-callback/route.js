import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

// kakao-start에서 받은 인가코드를 카카오 토큰 엔드포인트에서 id_token으로
// 바꾸고, 그 id_token으로 Supabase 세션을 만듦 (signInWithIdToken). 이
// 경로는 Supabase의 기본 카카오 OAuth(/auth/callback)를 안 거치기 때문에
// account_email을 요청하지 않음 — KOE205 회피.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get("kakao_state")?.value;
  const rawNonce = request.cookies.get("kakao_nonce")?.value;

  if (!code || !state || !savedState || state !== savedState || !rawNonce) {
    return NextResponse.redirect(`${origin}/partner/login?authError=1`);
  }

  try {
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_REST_API_KEY || "",
        client_secret: process.env.KAKAO_CLIENT_SECRET || "",
        redirect_uri: `${origin}/auth/kakao-callback`,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.id_token) {
      console.error("[jikko] 카카오 토큰 교환 실패", tokenData);
      return NextResponse.redirect(`${origin}/partner/login?authError=1`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "kakao",
      token: tokenData.id_token,
      nonce: rawNonce,
    });
    if (error) {
      console.error("[jikko] signInWithIdToken 실패", error);
      return NextResponse.redirect(`${origin}/partner/login?authError=1`);
    }

    const res = NextResponse.redirect(`${origin}/partner.html`);
    res.cookies.delete("kakao_nonce");
    res.cookies.delete("kakao_state");
    return res;
  } catch (e) {
    console.error("[jikko] 카카오 콜백 처리 실패", e);
    return NextResponse.redirect(`${origin}/partner/login?authError=1`);
  }
}
