import Users from "@/components/users/Users";
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

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

    // Remove the conflicting cache options
    const response = await fetch(apiUrl, {
      cache: "no-store", // Remove the revalidate option since we're using no-store
    });

    if (!response.ok) {
      const errorText = await response.text();
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-red-500">
            Failed to load users: {response.status} {errorText}
          </p>
        </div>
      );
    }

    const userGridResponse: userGridResponse[] = await response.json();
    console.log("Received users:", userGridResponse.length);

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
