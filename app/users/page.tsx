import Page from "@/components/shared/Page";
import Users from "@/components/users/Users";
import { currentUser } from "@clerk/nextjs/server";
import { getUsersWithCurrentlyReading } from "@/lib/queries/users";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserPage() {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg">User not logged in</p>
        </div>
      );
    }

    const userGridResponse = await getUsersWithCurrentlyReading();

    return (
      <Page>
        <Users users={userGridResponse} />
      </Page>
    );
  } catch (error) {
    console.error("StatsPage Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">
          Error:{" "}
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }
}
