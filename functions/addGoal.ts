"use server";

import { addGoalAction } from "@/actions/goalsActions";
import { InsertGoal } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";

export const addGoal = async (goalToAdd: Omit<InsertGoal, "id">) => {
  const userRightNow = await currentUser();

  goalToAdd.userId = userRightNow?.id;

  console.log("Calling action");

  addGoalAction(goalToAdd);
};
