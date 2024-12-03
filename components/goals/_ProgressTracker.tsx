import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  goal: number;
  completed: number;
}

export function ProgressTracker({ goal, completed }: ProgressTrackerProps) {
  const percentage = goal > 0 ? Math.min((completed / goal) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Reading Progress</h3>
      <Progress value={percentage} className="w-full" />
      <p className="text-sm text-gray-500">
        {completed} of {goal} books read ({percentage.toFixed(1)}%)
      </p>
    </div>
  );
}
