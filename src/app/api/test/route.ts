import { NextResponse } from "next/server";
import { claude, CLAUDE_MODEL } from "@/lib/claude";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test DB
    const jobCount = await prisma.job.count();

    // Test Claude API
    const message = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Say hello in one sentence and confirm you are Claude.",
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      status: "ok",
      database: {
        connected: true,
        jobCount,
      },
      claude: {
        connected: true,
        model: CLAUDE_MODEL,
        response: responseText,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
