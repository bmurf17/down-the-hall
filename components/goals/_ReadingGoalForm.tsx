"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { useState } from "react";

interface ReadingGoalFormProps {
  onSetGoal: (goal: number) => void;
}

export function ReadingGoalForm({ onSetGoal }: ReadingGoalFormProps) {
  const [goalInput, setGoalInput] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goal = parseInt(goalInput);
    if (!isNaN(goal) && goal > 0) {
      onSetGoal(goal);
      setGoalInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="reading-goal">Set Reading Goal (Books per Year)</Label>
        <Input
          id="reading-goal"
          type="number"
          value={goalInput}
          className="flex border-2 border-gray-200 p-4 rounded-xl mb-2 w-full bg-white"
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="Enter your goal"
          min="1"
        />
      </div>
      <div className="flex justify-end">
        <Button
          className={clsx(
            "bg-primary flex items-center justify-center p-4 rounded-lg text-sm/6 gap-2 text-white",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          type="submit"
        >
          Set Goal
        </Button>
      </div>
    </form>
  );
}
