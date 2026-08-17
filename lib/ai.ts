import OpenAI from "openai"

export async function askJarvis(message: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY fehlt in den Vercel Environment Variables.")
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const response = await openai.responses.create({
      model: "gpt-5",
      instructions:
        "Du bist JARVIS, ein freundlicher persönlicher KI-Assistent. Antworte auf Deutsch.",
      input: message,
    })

    return response.output_text
  } catch (error: any) {
    console.error("OPENAI ERROR:", error)

    throw new Error(
      error?.message || "OpenAI Anfrage fehlgeschlagen."
    )
  }
}
