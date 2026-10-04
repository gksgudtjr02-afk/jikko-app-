export const metadata = {
  title: "찍꼬 — 찍고 보내면 기사님이 옵니다",
  description: "가전제품이 고장났을 때 사진을 찍어 보내면 근처 수리기사님과 매칭되는 출동 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
