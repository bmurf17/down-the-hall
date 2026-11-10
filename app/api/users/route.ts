import { NextRequest, NextResponse } from "next/server";

import { getUsersWithCurrentlyReading } from "@/lib/queries/users";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const finalData = await getUsersWithCurrentlyReading();

    return NextResponse.json(finalData);
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
