// actions/goalsActions.ts
"use server";

import db from "@/lib/db";
import { InsertGoal, userGoals } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function addGoalAction(goal: Omit<InsertGoal, "id">) {
  const userRightNow = await currentUser();

  if (!userRightNow?.id) {
    throw new Error("User not authenticated");
  }

  const newGoal = await db
    .insert(userGoals)
    .values({
      bookCount: goal.bookCount,
      timeFrame: goal.timeFrame,
      userId: userRightNow.id,
    })
    .returning();

  // Revalidate the entire page to ensure fresh data
  revalidatePath("/stats");

  return newGoal[0];
}
