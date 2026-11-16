import { NextRequest, NextResponse } from "next/server";
import { getMixedPrograms } from "@/lib/online-programs";
import { UserResponses } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const responses: UserResponses = await request.json();

    if (!responses.nextBigMove?.trim() || !responses.whatsStoppingYou?.trim()) {
      return NextResponse.json(
        { error: "Please complete all questions" },
        { status: 400 }
      );
    }

    const recommendations = getMixedPrograms();

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
