import { NextRequest, NextResponse } from "next/server";

import { getUserWithCurrentlyReading } from "@/lib/queries/users";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const headers = new Headers({
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
    });

    const data = await getUserWithCurrentlyReading(params.userId);

    if (!data) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers }
      );
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
