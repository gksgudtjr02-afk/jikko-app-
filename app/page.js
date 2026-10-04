const styles = {
  wrap: {
    minHeight: "100dvh",
    background: "linear-gradient(180deg,#23262C,#17191D)",
    color: "#F5F3EF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily:
      '"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif',
    textAlign: "center",
    gap: "28px",
  },
  mark: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: '"Outfit","IBM Plex Sans KR",sans-serif',
    fontWeight: 800,
    fontSize: "40px",
    letterSpacing: "-0.02em",
  },
  lens: {
    display: "inline-block",
    width: "0.78em",
    height: "0.78em",
    borderRadius: "50%",
    border: "0.16em solid #FF6B00",
    position: "relative",
    top: "0.02em",
    marginLeft: "0.04em",
  },
  lead: {
    color: "#A3A8B0",
    fontSize: "16px",
    maxWidth: "320px",
    lineHeight: 1.6,
    margin: 0,
  },
  btnRow: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    maxWidth: "320px",
  },
  btn: {
    display: "block",
    width: "100%",
    padding: "18px",
    borderRadius: "16px",
    fontWeight: 700,
    fontSize: "16px",
    textDecoration: "none",
    boxSizing: "border-box",
  },
  primary: {
    background: "linear-gradient(135deg,#FF8A2B,#FF6B00)",
    color: "#fff",
    boxShadow: "0 8px 22px rgba(255,107,0,.3)",
  },
  secondary: {
    background: "rgba(255,255,255,.06)",
    color: "#F5F3EF",
    border: "1px solid rgba(255,255,255,.14)",
  },
};

export default function Home() {
  return (
    <main style={styles.wrap}>
      <span style={styles.mark}>
        JIKK<span style={styles.lens} />
      </span>
      <p style={styles.lead}>
        가전제품이 고장났을 때, 사진 한 장이면 근처 수리기사님이 출동해요.
      </p>
      <div style={styles.btnRow}>
        <a href="/customer.html" style={{ ...styles.btn, ...styles.primary }}>
          고객으로 시작하기
        </a>
        <a href="/partner.html" style={{ ...styles.btn, ...styles.secondary }}>
          기사님으로 시작하기
        </a>
      </div>
    </main>
  );
}
