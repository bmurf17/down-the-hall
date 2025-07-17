import Users from "@/components/users/Users";
import { getUsers } from "@/functions/getUsers";
import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { currentUser } from "@clerk/nextjs/server";

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

    const response = await getUsers();

    const userGridResponse: userGridResponse[] = response;

    return (
      <div className="mx-16">
        <Users users={userGridResponse} />
      </div>
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
