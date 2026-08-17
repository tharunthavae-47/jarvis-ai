export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color: "#22d3ee",
            letterSpacing: "8px",
            fontSize: "12px",
          }}
        >
          SYSTEM ONLINE
        </div>

        <h1
          style={{
            fontSize: "64px",
            letterSpacing: "16px",
          }}
        >
          JARVIS
        </h1>

        <p style={{ color: "#94a3b8" }}>
          Personal Artificial Intelligence
        </p>
      </div>
    </main>
  )
}
