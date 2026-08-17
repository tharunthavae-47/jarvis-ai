import { NextResponse } from "next/server"
import { askJarvis } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Keine Nachricht." },
        { status: 400 }
      )
    }

    const answer = await askJarvis(message)

    return NextResponse.json({
      answer,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "JARVIS konnte nicht antworten." },
      { status: 500 }
    )
  }
}
