import Stats from "@/components/stats/Stats";
import { currentUser } from "@clerk/nextjs/server";

interface Props {
  searchParams?: {
    start?: string;
    end?: string;
  };
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage({ searchParams }: Props) {
  const user = await currentUser();

  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">User not logged in</p>
      </div>
    );
  }

  const apiParams = new URLSearchParams({
    ...(searchParams?.start && { start: searchParams.start }),
    ...(searchParams?.end && { end: searchParams.end }),
  });


  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stats/${
      user.id
    }?${apiParams.toString()}`
  );

  console.log("Fetching from URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/stats/${user.id}?${apiParams.toString()}`);


  if (!response.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">Failed to load stats</p>
      </div>
    );
  }

  const stats = await response.json();

  return (
    <div className="mx-16 ">
      <Stats stats={stats} />
    </div>
  );
}
