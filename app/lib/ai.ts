import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function askJarvis(message: string) {
  const response = await openai.responses.create({
    model: "gpt-5",
    instructions: `
Du bist JARVIS, ein persönlicher KI-Assistent.

Sprich Deutsch, wenn der Benutzer Deutsch spricht.
Antworte freundlich, intelligent und eher kurz.
Du bist wie der Assistent aus Iron Man, aber ohne zu behaupten,
dass du wirklich JARVIS bist.
`,
    input: message,
  })

  return response.output_text
}
