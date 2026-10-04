import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

// 기사님 화면은 로그인이 필요함 (middleware.js가 비로그인 요청은 이미
// /partner/login으로 돌려보내지만, 혹시 몰라 여기서도 한 번 더 확인함).
//
// 정적 HTML이라도 "내가 누구인지" 알아야 콜보드에서 호출을 수락할 수
// 있어서, @supabase/ssr 쿠키 세션에서 꺼낸 access/refresh 토큰을 HTML에
// 끼워넣음 — 페이지 로드 시 그 토큰으로 브라우저의 Supabase 클라이언트가
// 같은 로그인 상태를 그대로 이어받아서(supabase.auth.setSession), 이후
// 콜보드 조회/수락 요청에 auth.uid()가 정상적으로 찍힘.
export async function GET(request) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/partner/login", request.url));
  }

  const filePath = path.join(process.cwd(), "html-src", "partner.html");
  let html = fs.readFileSync(filePath, "utf8");

  html = html
    .replaceAll("__SUPABASE_URL__", process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replaceAll("__SUPABASE_ANON_KEY__", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
    .replaceAll("__ACCESS_TOKEN__", session.access_token || "")
    .replaceAll("__REFRESH_TOKEN__", session.refresh_token || "")
    .replaceAll("__PARTNER_ID__", session.user?.id || "");

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
