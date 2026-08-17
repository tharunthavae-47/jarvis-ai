"use client"

import { useState } from "react"

export default function Home() {
  const [message, setMessage] = useState("")
  const [answer, setAnswer] = useState(
    "Wie kann ich Ihnen behilflich sein?"
  )
  const [status, setStatus] = useState("ONLINE")
  const [loading, setLoading] = useState(false)

  async function askJarvis(text = message) {
    if (!text.trim()) return

    setLoading(true)
    setStatus("THINKING")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      })

      const data = await response.json()

      setAnswer(data.answer || data.error)
      speak(data.answer || data.error)
    } catch {
      setAnswer("Verbindung zu JARVIS fehlgeschlagen.")
    }

    setLoading(false)
    setStatus("ONLINE")
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return

    const utterance = new SpeechSynthesisUtterance(text)

    utterance.lang = "de-DE"
    utterance.rate = 1

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Spracherkennung wird von diesem Browser nicht unterstützt.")
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = "de-DE"
    recognition.interimResults = false

    setStatus("LISTENING")

    recognition.start()

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript

      setMessage(text)
      askJarvis(text)
    }

    recognition.onend = () => {
      setStatus("ONLINE")
    }
  }

  return (
    <main className="jarvis-bg">
      <div
        style={{
          maxWidth: 850,
          margin: "auto",
          padding: "60px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: "#22d3ee",
              letterSpacing: "8px",
              fontSize: 12,
            }}
          >
            SYSTEM {status}
          </div>

          <h1
            style={{
              fontSize: 64,
              letterSpacing: "16px",
              margin: "20px 0 8px",
            }}
          >
            JARVIS
          </h1>

          <p style={{ color: "#94a3b8" }}>
            Personal Artificial Intelligence
          </p>
        </div>

        <div style={{ margin: "50px 0" }}>
          <div className="jarvis-core">
            <div className="jarvis-core-inner">
              <div className="jarvis-dot" />
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              minHeight: 120,
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            {loading ? "JARVIS denkt nach..." : answer}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
            }}
          >
            <button
              onClick={startListening}
              style={{
                background: "#22d3ee",
                border: 0,
                borderRadius: 12,
                padding: "12px 18px",
                cursor: "pointer",
              }}
            >
              🎤
            </button>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") askJarvis()
              }}
              placeholder="Sprich mit JARVIS..."
              style={{
                flex: 1,
                background: "#020617",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            />

            <button
              onClick={() => askJarvis()}
              style={{
                background: "#22d3ee",
                border: 0,
                borderRadius: 12,
                padding: "12px 20px",
                cursor: "pointer",
              }}
            >
              Senden
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
