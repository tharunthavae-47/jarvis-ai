"use client"

import { useEffect, useRef, useState } from "react"

type JarvisStatus = "ONLINE" | "LISTENING" | "THINKING" | "SPEAKING"

export default function Home() {
  const [message, setMessage] = useState("")
  const [answer, setAnswer] = useState(
    "Guten Tag. Wie kann ich Ihnen behilflich sein?"
  )
  const [status, setStatus] = useState<JarvisStatus>("ONLINE")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      recognitionRef.current?.abort()
    }
  }, [])

  async function askJarvis(text: string) {
    const cleanText = text.trim()

    if (!cleanText) return

    setMessage(cleanText)
    setStatus("THINKING")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: cleanText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Anfrage")
      }

      const jarvisAnswer =
        data.answer || "Ich konnte leider keine Antwort erzeugen."

      setAnswer(jarvisAnswer)

      speak(jarvisAnswer)
    } catch (error) {
      console.error(error)

      setAnswer(
        "Entschuldigung. Ich konnte momentan keine Verbindung zu meinem KI-System herstellen."
      )

      setStatus("ONLINE")
    }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setStatus("ONLINE")
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    utterance.lang = "de-DE"
    utterance.rate = 0.95
    utterance.pitch = 0.9
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      setStatus("SPEAKING")
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setStatus("ONLINE")
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setStatus("ONLINE")
    }

    window.speechSynthesis.speak(utterance)
  }

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert(
        "Dein Browser unterstützt keine Spracherkennung. Bitte verwende Google Chrome oder Microsoft Edge."
      )
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = "de-DE"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      setStatus("LISTENING")
    }

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript

      setMessage(text)

      askJarvis(text)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)

      setIsListening(false)
      setStatus("ONLINE")
    }

    recognition.onend = () => {
      setIsListening(false)

      setStatus((current) =>
        current === "LISTENING" ? "ONLINE" : current
      )
    }

    recognition.start()
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel()

    setIsSpeaking(false)
    setStatus("ONLINE")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    askJarvis(message)
  }

  const statusText = {
    ONLINE: "SYSTEM ONLINE",
    LISTENING: "LISTENING",
    THINKING: "THINKING",
    SPEAKING: "SPEAKING",
  }[status]

  return (
    <main className="jarvis-page">
      <div className="background-grid" />

      <div className="jarvis-container">

        {/* HEADER */}

        <header className="jarvis-header">
          <div className="system-status">
            <span className="status-dot" />
            {statusText}
          </div>

          <h1>JARVIS</h1>

          <p>PERSONAL ARTIFICIAL INTELLIGENCE</p>
        </header>

        {/* CORE */}

        <section className="core-section">
          <div
            className={`jarvis-core ${
              status === "LISTENING" ? "listening" : ""
            } ${status === "THINKING" ? "thinking" : ""} ${
              status === "SPEAKING" ? "speaking" : ""
            }`}
          >
            <div className="core-ring ring-one" />
            <div className="core-ring ring-two" />
            <div className="core-ring ring-three" />

            <div className="core-center">
              <div className="core-inner">
                <div className="core-dot" />
              </div>
            </div>
          </div>

          <div className="core-status">
            {status === "LISTENING" && "I'M LISTENING"}
            {status === "THINKING" && "PROCESSING"}
            {status === "SPEAKING" && "SPEAKING"}
            {status === "ONLINE" && "READY"}
          </div>
        </section>

        {/* RESPONSE */}

        <section className="response-panel">
          <div className="response-label">
            <span>JARVIS</span>
            <span className="response-line" />
          </div>

          <div className="response-text">
            {answer}
          </div>
        </section>

        {/* CHAT */}

        <form
          onSubmit={handleSubmit}
          className="command-panel"
        >
          <button
            type="button"
            onClick={startListening}
            className={`mic-button ${
              isListening ? "mic-active" : ""
            }`}
            title="Mikrofon"
          >
            <span className="mic-icon">
              {isListening ? "■" : "🎤"}
            </span>
          </button>

          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Sprich mit JARVIS..."
            autoComplete="off"
          />

          <button
            type="submit"
            className="send-button"
            disabled={!message.trim() || status === "THINKING"}
          >
            SEND
          </button>
        </form>

        {/* SPEAKING CONTROL */}

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="stop-speaking"
          >
            ■ STOP SPEAKING
          </button>
        )}

        {/* FOOTER */}

        <footer className="jarvis-footer">
          <span>AI CORE: ONLINE</span>
          <span>VOICE: READY</span>
          <span>SYSTEM: SECURE</span>
        </footer>
      </div>

      <style jsx>{`
        .jarvis-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 35%,
              rgba(0, 200, 255, 0.12),
              transparent 25%
            ),
            radial-gradient(
              circle at 50% 50%,
              rgba(0, 150, 255, 0.06),
              transparent 45%
            ),
            #020611;

          color: white;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .background-grid {
          position: absolute;
          inset: 0;
          opacity: 0.15;
          background-image:
            linear-gradient(
              rgba(0, 200, 255, 0.12) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0, 200, 255, 0.12) 1px,
              transparent 1px
            );
          background-size: 50px 50px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 20%,
            black 80%,
            transparent
          );
          pointer-events: none;
        }

        .jarvis-container {
          position: relative;
          z-index: 1;
          width: min(900px, 92%);
          margin: auto;
          padding: 55px 0 30px;
        }

        .jarvis-header {
          text-align: center;
        }

        .system-status {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;

          color: #22d3ee;
          font-size: 11px;
          letter-spacing: 4px;
          font-weight: 600;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 12px #22d3ee;
          animation: statusPulse 1.5s infinite;
        }

        .jarvis-header h1 {
          margin: 20px 0 8px;

          font-size: clamp(48px, 10vw, 86px);
          line-height: 1;
          letter-spacing: 18px;
          font-weight: 300;

          text-shadow:
            0 0 10px rgba(34, 211, 238, 0.5),
            0 0 35px rgba(34, 211, 238, 0.2);
        }

        .jarvis-header p {
          margin: 0;

          color: #64748b;
          font-size: 11px;
          letter-spacing: 5px;
        }

        .core-section {
          display: flex;
          flex-direction: column;
          align-items: center;

          margin: 60px 0 45px;
        }

        .jarvis-core {
          width: 270px;
          height: 270px;
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;
        }

        .core-ring {
          position: absolute;
          inset: 0;

          border-radius: 50%;
          border: 1px solid rgba(34, 211, 238, 0.25);
        }

        .ring-one {
          animation: rotate 12s linear infinite;
          border-top-color: #22d3ee;
          border-bottom-color: rgba(34, 211, 238, 0.05);
        }

        .ring-two {
          inset: 18px;
          animation: rotateReverse 8s linear infinite;

          border-right-color: #22d3ee;
          border-left-color: rgba(34, 211, 238, 0.05);
        }

        .ring-three {
          inset: 38px;
          animation: rotate 5s linear infinite;

          border-top-color: rgba(34, 211, 238, 0.8);
        }

        .core-center {
          width: 145px;
          height: 145px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border: 1px solid rgba(34, 211, 238, 0.55);

          box-shadow:
            0 0 25px rgba(34, 211, 238, 0.2),
            inset 0 0 30px rgba(34, 211, 238, 0.08);
        }

        .core-inner {
          width: 90px;
          height: 90px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border: 1px solid rgba(34, 211, 238, 0.6);

          box-shadow:
            0 0 25px rgba(34, 211, 238, 0.25),
            inset 0 0 20px rgba(34, 211, 238, 0.12);
        }

        .core-dot {
          width: 38px;
          height: 38px;

          border-radius: 50%;

          background: rgba(34, 211, 238, 0.2);

          border: 1px solid #22d3ee;

          box-shadow:
            0 0 20px #22d3ee,
            0 0 50px rgba(34, 211, 238, 0.4);

          animation: corePulse 2s infinite;
        }

        .jarvis-core.listening .core-dot {
          animation: listeningPulse 0.6s infinite;
        }

        .jarvis-core.thinking .core-dot {
          animation: thinkingPulse 0.8s infinite;
        }

        .jarvis-core.speaking .core-dot {
          animation: speakingPulse 0.35s infinite;
        }

        .jarvis-core.listening .core-ring {
          border-color: rgba(34, 211, 238, 0.8);
        }

        .core-status {
          margin-top: 25px;

          color: #22d3ee;

          font-size: 10px;
          letter-spacing: 5px;
        }

        .response-panel {
          margin-bottom: 20px;

          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;

          background: rgba(255, 255, 255, 0.025);

          backdrop-filter: blur(10px);

          padding: 22px 24px;
        }

        .response-label {
          display: flex;
          align-items: center;
          gap: 12px;

          color: #22d3ee;

          font-size: 10px;
          letter-spacing: 4px;
        }

        .response-line {
          height: 1px;
          flex: 1;

          background: linear-gradient(
            90deg,
            rgba(34, 211, 238, 0.5),
            transparent
          );
        }

        .response-text {
          margin-top: 15px;

          min-height: 65px;

          color: #cbd5e1;

          font-size: 16px;
          line-height: 1.7;
        }

        .command-panel {
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 10px;

          border: 1px solid rgba(34, 211, 238, 0.18);
          border-radius: 16px;

          background: rgba(2, 6, 17, 0.8);

          box-shadow:
            0 0 25px rgba(0, 0, 0, 0.3),
            inset 0 0 20px rgba(34, 211, 238, 0.02);
        }

        .command-panel input {
          flex: 1;

          min-width: 0;

          border: 0;
          outline: 0;

          background: transparent;

          color: white;

          padding: 14px 8px;

          font-size: 15px;
        }

        .command-panel input::placeholder {
          color: #475569;
        }

        .mic-button,
        .send-button {
          border: 0;
          cursor: pointer;

          transition: 0.2s ease;
        }

        .mic-button {
          width: 48px;
          height: 48px;

          flex-shrink: 0;

          border-radius: 12px;

          background: rgba(34, 211, 238, 0.08);

          color: #22d3ee;

          border: 1px solid rgba(34, 211, 238, 0.2);
        }

        .mic-button:hover {
          background: rgba(34, 211, 238, 0.16);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.15);
        }

        .mic-active {
          background: #22d3ee;
          color: #020617;
          animation: micPulse 1s infinite;
        }

        .mic-icon {
          font-size: 17px;
        }

        .send-button {
          height: 48px;

          padding: 0 22px;

          border-radius: 12px;

          background: #22d3ee;
          color: #020617;

          font-weight: 700;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .send-button:hover {
          box-shadow: 0 0 25px rgba(34, 211, 238, 0.35);
        }

        .send-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .stop-speaking {
          display: block;

          margin: 15px auto 0;

          padding: 8px 15px;

          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;

          background: rgba(255, 255, 255, 0.03);

          color: #94a3b8;

          font-size: 10px;
          letter-spacing: 2px;

          cursor: pointer;
        }

        .jarvis-footer {
          display: flex;
          justify-content: center;
          gap: 30px;

          margin-top: 35px;

          color: #334155;

          font-size: 9px;
          letter-spacing: 2px;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotateReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes corePulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.65;
          }

          50% {
            transform: scale(1.18);
            opacity: 1;
          }
        }

        @keyframes listeningPulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.4);
          }
        }

        @keyframes thinkingPulse {
          0%,
          100% {
            transform: scale(0.8);
          }

          50% {
            transform: scale(1.3);
          }
        }

        @keyframes speakingPulse {
          0%,
          100% {
            transform: scale(0.9);
          }

          50% {
            transform: scale(1.5);
          }
        }

        @keyframes statusPulse {
          0%,
          100% {
            opacity: 0.4;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes micPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.5);
          }

          70% {
            box-shadow: 0 0 0 10px rgba(34, 211, 238, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
          }
        }

        @media (max-width: 600px) {
          .jarvis-container {
            padding-top: 35px;
          }

          .jarvis-header h1 {
            letter-spacing: 10px;
          }

          .jarvis-core {
            width: 220px;
            height: 220px;
          }

          .core-center {
            width: 120px;
            height: 120px;
          }

          .core-inner {
            width: 75px;
            height: 75px;
          }

          .core-dot {
            width: 30px;
            height: 30px;
          }

          .command-panel {
            flex-wrap: wrap;
          }

          .command-panel input {
            order: 1;
            flex-basis: calc(100% - 60px);
          }

          .send-button {
            order: 2;
            width: 100%;
          }

          .jarvis-footer {
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }
        }
      `}</style>
    </main>
  )
}
