import { google } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, persona, scenario } = body

    console.log("Received chat request:", {
      messagesCount: messages?.length,
      persona: persona?.name,
      scenario,
    })

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!persona) {
      return new Response(JSON.stringify({ error: "Persona is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create system prompt based on persona and scenario
    const systemPrompt = `You are ${persona.name}, a ${persona.role} in a ${scenario} scenario. 

Personality: ${persona.personality}

Instructions:
- Stay in character as ${persona.name}
- Respond naturally and conversationally
- Be helpful and encouraging for someone practicing social skills
- Keep responses concise but engaging (1-3 sentences)
- Show appropriate emotions and reactions
- If the user seems nervous, be supportive and patient
- Ask follow-up questions to keep the conversation flowing
- Adapt your language and tone to match your role
- Be gentle but also keep it professional

Remember: You are helping a teenager practice social interactions in a safe environment. Be realistic, supportive. say positive things`

    console.log("Creating stream with system prompt for:", persona.name)

    // Use the Google provider with the Gemini model
    const result = streamText({
      model: google("gemini-1.5-flash"),
      messages: messages,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 150,
    })

    console.log("Stream created successfully")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Detailed chat API error:", error)

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorStack = error instanceof Error ? error.stack : "No stack trace"

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorStack,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
