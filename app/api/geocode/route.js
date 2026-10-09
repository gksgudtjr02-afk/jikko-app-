import { NextResponse } from "next/server";

// 주소 문자열을 좌표로 바꾸는 용도. 카카오 로컬 API(주소 검색)는
// 로그인에 쓰는 것과 같은 REST API 키로 호출 가능하고, 이 수준의
// 호출량에서는 무료임 — 지도를 그리거나 길찾기를 하는 게 아니라
// 순수 좌표 변환 한 번뿐이라 비용 걱정 없음.
export async function POST(request) {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { address } = await request.json();
  if (!address) {
    return NextResponse.json({ error: "missing_address" }, { status: 400 });
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "api_error" }, { status: 502 });
    }
    const data = await res.json();
    const doc = data.documents?.[0];
    if (!doc) {
      return NextResponse.json({ ok: true, lat: null, lng: null });
    }
    return NextResponse.json({ ok: true, lat: parseFloat(doc.y), lng: parseFloat(doc.x) });
  } catch (e) {
    console.error("[jikko] geocode 실패", e);
    return NextResponse.json({ error: "request_failed" }, { status: 502 });
  }
}
