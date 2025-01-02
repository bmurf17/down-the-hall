"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { useState } from "react";

interface ReadingGoalFormProps {
  onSetGoal: (goal: number) => void;
  isSubmitting: boolean;
}

export function ReadingGoalForm({
  onSetGoal,
  isSubmitting,
}: ReadingGoalFormProps) {
  const [goalInput, setGoalInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goal = parseInt(goalInput);
    if (!isSubmitting && !isNaN(goal) && goal > 0) {
      onSetGoal(goal);
      setGoalInput("");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="reading-goal">
          Set Reading Goal (For {currentYear})
        </Label>
        <Input
          id="reading-goal"
          type="number"
          value={goalInput}
          className="flex border-2 border-gray-200 p-4 rounded-xl mb-2 w-full bg-white"
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="Enter your goal"
          min="1"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className={clsx(
            "bg-primary flex items-center justify-center p-4 rounded-lg text-sm/6 gap-2 text-white",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Setting Goal..." : "Set Goal"}
        </Button>
      </div>
    </form>
  );
}
