"use server";

import db, { DB } from "@/lib/db";
import { InsertGoal, userGoals } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function addGoalAction(goal: Omit<InsertGoal, "id">) {
  const userRightNow = await currentUser();
  const thisYear = new Date().getFullYear();

  if (!userRightNow?.id) {
    throw new Error("User not authenticated");
  }

  // Upsert against the unique (user_id, goal_year) index so two concurrent
  // submissions cannot create duplicate goals for the same year.
  const [resultGoal] = await db
    .insert(userGoals)
    .values({
      bookCount: goal.bookCount,
      timeFrame: goal.timeFrame,
      userId: userRightNow.id,
      goalYear: thisYear,
    })
    .onConflictDoUpdate({
      target: [userGoals.userId, userGoals.goalYear],
      set: {
        bookCount: goal.bookCount,
        timeFrame: goal.timeFrame,
      },
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/stats");

  return resultGoal;
}
