import db from "@/lib/db";
import { InsertGoal, userGoals } from "@/lib/schema";
import { revalidateTag } from "next/cache";

export const addGoalAction = async (goal: InsertGoal) => {
  await db.insert(userGoals).values({
    bookCount: goal.bookCount,
    timeFrame: goal.timeFrame,
    userId: goal.userId,
  });

  console.log("Inserted");

  console.log(goal);
  revalidateTag(`goals/${goal.userId}`);
};
