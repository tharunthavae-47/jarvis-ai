import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = body?.message

    if (!message) {
      return NextResponse.json(
        { error: "Keine Nachricht erhalten." },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ist in Vercel nicht vorhanden." },
        { status: 500 }
      )
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-5",
          instructions:
            "Du bist JARVIS, ein freundlicher persönlicher KI-Assistent. Antworte auf Deutsch.",
          input: message,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("OPENAI ERROR:", data)

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "OpenAI hat einen Fehler zurückgegeben.",
        },
        { status: response.status }
      )
    }

    const answer =
      data.output
        ?.flatMap((item: any) => item.content || [])
        ?.find((item: any) => item.type === "output_text")
        ?.text || "Ich konnte keine Antwort erzeugen."

    return NextResponse.json({ answer })
  } catch (error: any) {
    console.error("SERVER ERROR:", error)

    return NextResponse.json(
      {
        error: error?.message || "Unbekannter Serverfehler.",
      },
      { status: 500 }
    )
  }
}
