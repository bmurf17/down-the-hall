"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "@/types/book";
import { useState } from "react";
import { CompletedBooksList } from "./_CompletedBookList";
import { ProgressTracker } from "./_ProgressTracker";
import { ReadingGoalForm } from "./_ReadingGoalForm";

export default function Goals() {
  const [goal, setGoal] = useState(0);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);

  const handleSetGoal = (newGoal: number) => {
    setGoal(newGoal);
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
            <ReadingGoalForm onSetGoal={handleSetGoal} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTracker goal={goal} completed={completedBooks.length} />
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
