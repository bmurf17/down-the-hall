"use server";

import db, { DB } from "@/lib/db";
import { InsertGoal, userGoals } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function addGoalAction(goal: Omit<InsertGoal, "id">) {
  const userRightNow = await currentUser();
  const thisYear = new Date().getFullYear();

  if (!userRightNow?.id) {
    throw new Error("User not authenticated");
  }

  const existingGoal = await db.query.userGoals.findFirst({
    where: (userGoals: { userId: any; goalYear: any }, { eq, and }: any) =>
      and(
        eq(userGoals.userId, userRightNow.id),
        eq(userGoals.goalYear, thisYear)
      ),
  });

  let resultGoal;

  if (existingGoal) {
    // Update existing goal
    const updated = await db
      .update(userGoals)
      .set({
        bookCount: goal.bookCount,
        timeFrame: goal.timeFrame,
      })
      .where(
        and(
          eq(userGoals.userId, userRightNow.id),
          eq(userGoals.goalYear, thisYear)
        )
      )
      .returning();

    resultGoal = updated[0];
  } else {
    // Insert new goal
    const inserted = await db
      .insert(userGoals)
      .values({
        bookCount: goal.bookCount,
        timeFrame: goal.timeFrame,
        userId: userRightNow.id,
        goalYear: thisYear,
      })
      .returning();

    resultGoal = inserted[0];
  }

  // Revalidate the entire page to ensure fresh data
  revalidatePath("/stats");

  return resultGoal;
}
