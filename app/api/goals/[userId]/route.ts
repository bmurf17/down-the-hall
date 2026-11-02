import { NextRequest, NextResponse } from "next/server";

import { getUserGoals } from "@/lib/queries/goals";

function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function OPTIONS(): Promise<NextResponse> {
  const response = NextResponse.json({}, { status: 200 });
  return addCorsHeaders(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  // Intentionally public read-only profile data (reading goals and the books
  // counted towards them). It contains no notes or credentials.
  const { userId } = params;

  const data = await getUserGoals(userId);

  return addCorsHeaders(NextResponse.json(data));
}
