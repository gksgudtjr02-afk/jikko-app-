import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// 카카오 로그인을 Supabase에 실제로 연동 완료함 (2026-10) — 다시 보호 켬.
const SKIP_PARTNER_AUTH_FOR_TESTING = false;

export async function middleware(request) {
  let response = NextResponse.next({ request });

  if (SKIP_PARTNER_AUTH_FOR_TESTING) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session so server components always see a valid cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 기사님(파트너) 화면은 로그인 필요 — 가입/로그인 페이지 자체는 예외.
  const { pathname } = request.nextUrl;
  if (pathname === "/partner.html") {
    if (!user) {
      return NextResponse.redirect(new URL("/partner/login", request.url));
    }
    // 카카오 첫 로그인은 이름/번호가 없어서 partners에 프로필이 아직
    // 없을 수 있음 — 그러면 간단한 입력 화면으로 먼저 보냄.
    const { data: profile } = await supabase
      .from("partners")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile) {
      return NextResponse.redirect(new URL("/partner/profile-setup", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
