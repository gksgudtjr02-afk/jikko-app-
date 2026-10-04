import fs from "node:fs";
import path from "node:path";

// 고객용 프로토타입은 비회원이라 세션 주입이 필요 없고, 공개(anon) 키만
// 템플릿에 끼워넣으면 됨. 실제 파일은 html-src/customer.html에 있고
// (public/에 안 둔 이유: env var를 끼워넣으려면 요청 시점에 손봐야 해서),
// 빌드 시 next.config.mjs의 outputFileTracingIncludes로 이 파일이
// 서버리스 번들에 포함되도록 설정해뒀음.
export async function GET() {
  const filePath = path.join(process.cwd(), "html-src", "customer.html");
  let html = fs.readFileSync(filePath, "utf8");

  html = html
    .replaceAll("__SUPABASE_URL__", process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replaceAll("__SUPABASE_ANON_KEY__", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
