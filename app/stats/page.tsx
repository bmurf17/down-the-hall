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


  return (
    <div className="mx-16 ">
      <Stats/>
    </div>
  );
}
