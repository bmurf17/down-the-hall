"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "@/types/book";
import { useState, useOptimistic, useTransition } from "react";
import { CompletedBooksList } from "./_CompletedBookList";
import { ProgressTracker } from "./_ProgressTracker";
import { ReadingGoalForm } from "./_ReadingGoalForm";
import { InsertGoal, SelectBook, SelectGoal } from "@/lib/schema";
import { GoalTimeFrame } from "@/types/enums/goalsEnum";
import { addGoalAction } from "@/actions/goalsActions";

interface Props {
  completedBooks: SelectBook[];
  goals: SelectGoal[];
}

export default function Goals({ completedBooks, goals }: Props) {
  const [isPending, startTransition] = useTransition();

  // Use optimistic state for goals
  const [optimisticGoals, setOptimisticGoals] = useOptimistic(
    goals,
    (state, newGoal: any) => {
      // Immediately update the UI with the new goal
      return [
        ...state.filter((g) => g.timeFrame !== newGoal.timeFrame),
        {
          ...newGoal,
        },
      ];
    }
  );

  const handleSetGoal = async (bookCount: number) => {
    const newGoal: Omit<InsertGoal, "id"> = {
      bookCount: bookCount,
      timeFrame: GoalTimeFrame.Year,
      userId: undefined, // Will be set server-side
    };

    // Optimistically update the UI
    startTransition(() => {
      setOptimisticGoals(newGoal);
    });

    // Perform the actual server action
    try {
      await addGoalAction(newGoal);
    } catch (error) {
      console.error("Failed to add goal", error);
      // Optionally handle error (e.g., show toast)
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reading Goals Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Set Reading Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadingGoalForm
              onSetGoal={handleSetGoal}
              isSubmitting={isPending}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTracker
              goal={optimisticGoals[0]?.bookCount || 0}
              completed={completedBooks.length}
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Completed Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <CompletedBooksList books={completedBooks} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
