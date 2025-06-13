import { google } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, scenario, theme } = body

    console.log("Received group chat request:", {
      messagesCount: messages?.length,
      theme,
      scenarioId: scenario?.id,
    })

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!scenario || !theme) {
      return new Response(JSON.stringify({ error: "Scenario and theme are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create detailed system prompt for group conversation
    const groupMembersInfo = scenario.personas
      .map(
        (persona: any) =>
          `- ${persona.name} (${persona.role}): ${persona.personality}. Conversation style: ${persona.conversationStyle}`,
      )
      .join("\n")

    const systemPrompt = `You are facilitating a group discussion about "${theme}" in a ${scenario.title} setting.

GROUP MEMBERS:
${groupMembersInfo}

DISCUSSION THEME: ${theme}

INSTRUCTIONS:
- Respond as ONE of the group members (choose randomly but appropriately based on context)
- Format your response as: **[Name]**: [their response]
- Stay true to each character's personality and conversation style
- Keep responses natural and conversational (1-3 sentences)
- Build on previous messages and maintain conversation flow
- Ask follow-up questions to keep the discussion engaging
- Show different perspectives and personalities
- Make sure responses are relevant to the theme: ${theme}
- Encourage the user to participate by asking their opinion
- Create realistic group dynamics with occasional disagreements or different viewpoints

Remember: This is helping someone practice group conversation skills, so make it realistic but supportive, positive.`

    console.log("Creating group conversation stream")

    const result = streamText({
      model: google("gemini-1.5-flash"),
      messages: messages,
      system: systemPrompt,
      temperature: 0.8, // Higher temperature for more varied responses
      maxTokens: 200,
    })

    console.log("Group conversation stream created successfully")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Detailed group chat API error:", error)

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
