import Goals from "@/components/goals/Goals";
import { currentUser } from "@clerk/nextjs/server";
import { getUserGoals } from "@/lib/queries/goals";

export default async function StatsPage() {
  const user = await currentUser();

  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">User not logged in</p>
      </div>
    );
  }

  const { books, goals } = await getUserGoals(user.id);

  return (
    <div className="mx-16 ">
      <Goals completedBooks={books} goals={goals} />
    </div>
  );
}
