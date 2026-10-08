import { NextResponse } from "next/server";

// 고객이 3단계(에러코드 사진)에서 실제로 찍은 사진을 Claude의 비전
// 기능으로 읽어서 화면에 뜬 에러코드/표시를 실제로 추론함. 그 전까지는
// 장비 카테고리별로 하드코딩된 가짜 코드("E1" 등)만 보여주고 있었음.
//
// ANTHROPIC_API_KEY가 아직 설정 안 돼있으면 조용히 501을 반환하고,
// 클라이언트는 기존 하드코딩 결과로 자동 폴백함(다른 유료 연동들과
// 같은 패턴) — 키만 추가하면 코드 수정 없이 바로 실제 분석으로 전환됨.
export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { imageDataUrl, equipment } = await request.json();
  if (!imageDataUrl || !imageDataUrl.startsWith("data:")) {
    return NextResponse.json({ error: "missing_image" }, { status: 400 });
  }

  const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }
  const [, mediaType, base64Data] = match;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              {
                type: "text",
                text:
                  `이 사진은 한국의 "${equipment || "가전/설비"}" 고장 신고 접수 중 ` +
                  `찍은 표시창(디스플레이) 사진입니다. 화면에 보이는 에러 코드나 ` +
                  `문자·숫자 표시가 있으면 정확히 읽어주세요. 아래 JSON 형식으로만 ` +
                  `답하고, 다른 설명은 붙이지 마세요.\n` +
                  `{"code": "보이는 코드 그대로(예: E1, F3) 또는 안 보이면 null", ` +
                  `"note": "화면에 뭐라고 표시되어 있는지 한 문장 설명"}`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[jikko] Claude API 에러", res.status, errText);
      return NextResponse.json({ error: "api_error" }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    let parsed;
    try {
      parsed = JSON.parse(text.trim().replace(/^```json\s*|```$/g, ""));
    } catch (e) {
      console.error("[jikko] AI 응답 파싱 실패", text);
      return NextResponse.json({ error: "parse_error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, code: parsed.code || null, note: parsed.note || "" });
  } catch (e) {
    console.error("[jikko] diagnose-photo 실패", e);
    return NextResponse.json({ error: "request_failed" }, { status: 502 });
  }
}
