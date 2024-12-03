import Goals from "@/components/goals/Goals";
import { currentUser } from "@clerk/nextjs/server";

export default async function StatsPage() {
  const user = await currentUser();

  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">User not logged in</p>
      </div>
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/goals/${user.id}`
  );
  if (!response.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">Failed to load stats</p>
      </div>
    );
  }

  const booksRead = await response.json();
  console.log(booksRead);

  return (
    <div className="mx-16 ">
      <Goals />
    </div>
  );
}
