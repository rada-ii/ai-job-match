import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { claude, CLAUDE_MODEL } from "@/lib/claude";

// TypeScript tip za jedan match koji Claude treba da vrati
interface ClaudeMatchResponse {
  jobId: string;
  score: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Uzmi profileId iz request-a
    const body = await request.json();
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 },
      );
    }

    // 2. Učitaj profil iz baze
    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Učitaj sve poslove iz baze
    const jobs = await prisma.job.findMany();

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: "No jobs in database. Run seed script first." },
        { status: 404 },
      );
    }

    // 4. Pripremi prompt za Claude
    const systemPrompt = `You are an expert career advisor and job matching specialist.
Your task is to rank job listings based on how well they match a candidate's profile.

You must respond with ONLY valid JSON, no markdown, no extra text.
The JSON must be an array of objects with this exact structure:
[
  {
    "jobId": "string (the job's id)",
    "score": number (0-100),
    "reasoning": "string (2-3 sentences explaining the match)"
  }
]

Score guidelines:
- 90-100: Perfect match (skills, level, remote preference all align)
- 70-89: Strong match (most criteria met)
- 50-69: Decent match (some gaps but viable)
- 30-49: Weak match (significant gaps)
- 0-29: Poor match (skip or major upskilling needed)

Consider: skill overlap, experience level, remote preference, location, and role alignment.`;

    const userPrompt = `Candidate Profile:
- Name: ${profile.name}
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience}
- Preferred roles: ${profile.preferredRoles.join(", ") || "Any"}
- Location: ${profile.location || "Not specified"}
- Remote only: ${profile.remoteOnly}
- Bio: ${profile.bio || "Not provided"}

Available Jobs:
${JSON.stringify(
  jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    level: job.level,
    skills: job.skills,
    remote: job.remote,
    description: job.description,
  })),
  null,
  2,
)}

Rank all ${jobs.length} jobs and return the JSON array.`;

    // 5. Pozovi Claude API
    const message = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // 6. Izvadi tekst iz Claude odgovora
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // 7. Parsiraj JSON (sa fallback ako Claude vrati "prljav" JSON)
    let matchesData: ClaudeMatchResponse[];
    try {
      // Pokušaj direktan parse
      matchesData = JSON.parse(responseText);
    } catch {
      // Fallback: izvuci JSON iz markdown bloka ako ga Claude umota
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not parse JSON from Claude response");
      }
      matchesData = JSON.parse(jsonMatch[0]);
    }

    // 8. Validacija da je niz
    if (!Array.isArray(matchesData)) {
      throw new Error("Claude did not return an array");
    }

    // 9. Prvo obriši stare matches za ovaj profil (clean re-run)
    await prisma.match.deleteMany({
      where: { profileId },
    });

    // 10. Snimi nove matches u bazu
    const createdMatches = await Promise.all(
      matchesData.map((m) =>
        prisma.match.create({
          data: {
            jobId: m.jobId,
            profileId,
            score: m.score,
            reasoning: m.reasoning,
          },
          include: {
            job: true, // Include full job data u odgovoru
          },
        }),
      ),
    );

    // 11. Sortiraj po score (najbolji prvi)
    const sortedMatches = createdMatches.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      count: sortedMatches.length,
      matches: sortedMatches,
    });
  } catch (error) {
    console.error("Match generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate matches",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
