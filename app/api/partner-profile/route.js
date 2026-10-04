import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

// 가입 직후 partners 프로필을 저장하는 전용 라우트. 서비스 롤 키로
// RLS를 우회해서 저장하기 때문에, Supabase의 "이메일 확인" 설정이
// 켜져 있어서 가입 직후 세션이 아직 없는 경우에도(= 브라우저 쪽
// anon 클라이언트는 아직 로그인 상태가 아님) 항상 정상적으로
// 프로필이 저장됨. userId는 Supabase auth가 이미 발급한 값만 받아서
// 그 id로만 쓰기 때문에 임의의 사용자 데이터를 덮어쓸 위험은 없음.
export async function POST(request) {
  const { userId, name, phone } = await request.json();
  if (!userId || !name || !phone) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partners")
    .upsert({ id: userId, name, phone });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
