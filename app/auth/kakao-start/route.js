import { NextResponse } from "next/server";
import crypto from "node:crypto";

// Supabase의 기본 카카오 연동(signInWithOAuth)은 서버가 account_email까지
// scope에 끼워 넣는데, 비즈 앱 전환 전이라 그 항목 권한이 없어서 카카오가
// KOE205로 거부함(계속 확인됨). 대신 카카오 OpenID Connect를 우리가 직접
// 호출해서 scope을 profile_nickname/profile_image만 요청하고, 발급받은
// id_token을 supabase.auth.signInWithIdToken()에 넘겨 세션을 만듦.
export async function GET(request) {
  const { origin } = new URL(request.url);
  const rawNonce = crypto.randomUUID();
  const hashedNonce = crypto.createHash("sha256").update(rawNonce).digest("hex");
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", process.env.KAKAO_REST_API_KEY || "");
  authorizeUrl.searchParams.set("redirect_uri", `${origin}/auth/kakao-callback`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid profile_nickname profile_image");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("nonce", hashedNonce);

  const res = NextResponse.redirect(authorizeUrl);
  const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 300 };
  res.cookies.set("kakao_nonce", rawNonce, cookieOpts);
  res.cookies.set("kakao_state", state, cookieOpts);
  return res;
}
