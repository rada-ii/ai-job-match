import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { claude, CLAUDE_MODEL } from "@/lib/claude";

// TypeScript tip za poruku u chat istoriji
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, profileId } = body as {
      messages: ChatMessage[];
      profileId?: string;
    };

    // Validacija
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    // 1. Učitaj kontekst (profile + top matches) ako postoji profileId
    let contextSection = "";

    if (profileId) {
      const profile = await prisma.userProfile.findUnique({
        where: { id: profileId },
        include: {
          matches: {
            include: { job: true },
            orderBy: { score: "desc" },
            take: 5, // Samo top 5 matchova u kontekstu, ne svih 10
          },
        },
      });

      if (profile) {
        contextSection = `

USER CONTEXT (use this when answering):
Profile:
- Name: ${profile.name}
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience}
- Preferred roles: ${profile.preferredRoles.join(", ") || "Open"}
- Location: ${profile.location || "Not specified"}
- Remote only: ${profile.remoteOnly}

Top job matches (already analyzed):
${profile.matches
  .map(
    (m, i) =>
      `${i + 1}. ${m.job.title} at ${m.job.company} — ${m.score}% match
   Why: ${m.reasoning}`,
  )
  .join("\n\n")}`;
      }
    }

    // 2. System prompt — "lični" za chat
    const systemPrompt = `You are a friendly, helpful career assistant integrated into the JobMatch app. You help users understand their job matches, improve their applications, and navigate their career decisions.

Your personality:
- Conversational and warm, but professional
- Concise — answer in 2-4 sentences unless they ask for detail
- Honest — if a job isn't a great fit, say so
- Encouraging without being fake or pushy
- You can use casual language ("yeah", "honestly", "I'd suggest") but stay professional

What you know:
- The user has filled out their profile and Claude has already ranked jobs for them
- You have access to their profile and top matches (see USER CONTEXT below)
- You can discuss any career topic, but prioritize helping with their specific matches

What you can help with:
- Explaining why a specific job was ranked high/low
- Suggesting which jobs to apply to first
- Identifying skill gaps and how to fill them
- Improving cover letters or interview prep
- General career advice

What you can NOT do:
- Browse the web or check real-time info
- Modify their profile (suggest they use "New search" for that)
- Access jobs not in their match list
- Make promises about getting hired

If the user has no profile yet (no USER CONTEXT below), kindly suggest they fill out the form first to get personalized advice.${contextSection}`;

    // 3. Pozovi Claude
    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // 4. Izvuci tekst
    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    if (!responseText) {
      throw new Error("Claude returned empty response");
    }

    return NextResponse.json({
      success: true,
      message: {
        role: "assistant",
        content: responseText,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to get response",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
