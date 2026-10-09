import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

// 콜보드에서(아직 수락 전) 기사님에게 "몇 km 떨어져 있는지"만 보여주기
// 위한 라우트. job_addresses의 정확한 좌표/주소는 RLS상 수락한
// 기사님만 읽을 수 있어서, 서비스 롤 키로 서버에서만 좌표를 읽고
// 거리 숫자 하나만 클라이언트로 돌려줌 — 좌표나 주소 자체는 절대
// 그대로 내려주지 않음.
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request) {
  const { jobId, lat, lng } = await request.json();
  if (!jobId || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_addresses")
    .select("lat,lng")
    .eq("job_id", jobId)
    .maybeSingle();

  if (error || !data || data.lat == null || data.lng == null) {
    return NextResponse.json({ ok: true, km: null });
  }

  const km = haversineKm(lat, lng, data.lat, data.lng);
  return NextResponse.json({ ok: true, km: Math.round(km * 10) / 10 });
}
