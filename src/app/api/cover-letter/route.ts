import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { claude, CLAUDE_MODEL } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    // 1. Uzmi matchId
    const body = await request.json();
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 },
      );
    }

    // 2. Učitaj match SA profilom i poslom (eager load)
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        profile: true,
        job: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // 3. Pripremi prompt
    const systemPrompt = `You are an expert career writer specializing in cover letters.
Write a professional, personalized cover letter that:
- Opens with a strong hook (not "I am writing to apply for...")
- Highlights 2-3 specific skill matches between candidate and job
- Shows genuine interest in the company (based on the job description)
- Closes with a clear call-to-action
- Is concise: 250-350 words total
- Uses confident but warm tone
- Avoids clichés like "team player" or "passionate about"

Return ONLY the cover letter text, no preamble, no markdown formatting, no "Dear Hiring Manager" greeting (start from the body).`;

    const userPrompt = `Write a cover letter for this candidate applying to this job.

CANDIDATE:
- Name: ${match.profile.name}
- Skills: ${match.profile.skills.join(", ")}
- Experience: ${match.profile.experience} years
- Preferred roles: ${match.profile.preferredRoles.join(", ") || "Open"}
- Bio: ${match.profile.bio || "Not provided"}

JOB:
- Title: ${match.job.title}
- Company: ${match.job.company}
- Required skills: ${match.job.skills.join(", ")}
- Level: ${match.job.level}
- Description: ${match.job.description}

MATCH ANALYSIS:
- Match score: ${match.score}/100
- Why this fits: ${match.reasoning}

Write the cover letter now.`;

    // 4. Pozovi Claude
    const message = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const letterText =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!letterText) {
      throw new Error("Claude returned empty response");
    }

    // 5. Snimi pismo u bazu
    const coverLetter = await prisma.coverLetter.create({
      data: {
        content: letterText,
        matchId: match.id,
        profileId: match.profileId,
      },
    });

    // 6. Vrati pismo
    return NextResponse.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate cover letter",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
