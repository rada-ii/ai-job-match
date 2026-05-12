import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body iz request-a
    const body = await request.json();

    // 2. Validacija obaveznih polja
    if (!body.name || !body.skills || !body.experience) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["name", "skills", "experience"],
        },
        { status: 400 }
      );
    }

    // 3. Validacija da skills mora biti array
    if (!Array.isArray(body.skills) || body.skills.length === 0) {
      return NextResponse.json(
        { error: "Skills must be a non-empty array" },
        { status: 400 }
      );
    }

    // 4. Snimi profil u bazu preko Prisma
    const profile = await prisma.userProfile.create({
      data: {
        name: body.name,
        email: body.email || null,
        skills: body.skills,
        experience: body.experience, // "0-1" | "1-3" | "3-5" | "5+"
        preferredRoles: body.preferredRoles || [],
        location: body.location || null,
        remoteOnly: body.remoteOnly || false,
        bio: body.bio || null,
      },
    });

    // 5. Vrati kreiran profil sa ID-jem
    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}