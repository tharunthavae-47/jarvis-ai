import { NextResponse } from "next/server"
import { askJarvis } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Keine Nachricht erhalten." },
        { status: 400 }
      )
    }

    const answer = await askJarvis(message)

    return NextResponse.json({
      answer,
    })
  } catch (error: any) {
    console.error("JARVIS ERROR:", error)

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unbekannter Fehler.",
      },
      { status: 500 }
    )
  }
}
