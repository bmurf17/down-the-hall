import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  goal: number;
  completed: number;
}

export function ProgressTracker({ goal, completed }: ProgressTrackerProps) {
  // Calculate percentage
  const percentage = goal > 0 ? Math.min((completed / goal) * 100, 100) : 0;

  // Calculate remaining books
  const remainingBooks = goal - completed;

  // Calculate weeks and months left in the year
  const currentDate = new Date();
  const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil(
    (endOfYear.getTime() - currentDate.getTime()) / millisecondsPerDay
  );
  const weeksLeft = Math.ceil(daysLeft / 7);
  const monthsLeft = Math.ceil(daysLeft / 30);

  // Calculate books to read per week and month
  const booksPerWeek = remainingBooks > 0 ? remainingBooks / weeksLeft : 0;
  const booksPerMonth = remainingBooks > 0 ? remainingBooks / monthsLeft : 0;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Reading Progress</h3>
      <Progress
        value={(completed / goal) * 100}
        className="w-[60%] bg-slate-100 "
        indicatorColor="bg-gradient-to-r from-blue-500 to-green-500"
      />
      <p className="text-sm text-gray-500">
        {completed} of {goal} books read ({percentage.toFixed(1)}%)
      </p>
      <p className="text-sm text-gray-500">
        To reach your goal, read {booksPerWeek.toFixed(1)} book(s) per week or{" "}
        {booksPerMonth.toFixed(1)} book(s) per month
      </p>
    </div>
  );
}
