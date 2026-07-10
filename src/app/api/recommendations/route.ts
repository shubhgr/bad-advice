import { NextRequest, NextResponse } from "next/server";
import { getProgramsForArea } from "@/lib/online-programs";
import { UserResponses } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const responses: UserResponses = await request.json();

    if (!responses.areaToExplore?.trim()) {
      return NextResponse.json(
        { error: "Please select an area to explore" },
        { status: 400 }
      );
    }

    const recommendations = getProgramsForArea(responses.areaToExplore);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
