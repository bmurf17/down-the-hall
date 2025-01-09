export async function getUserActivityLogData(userId: string | undefined) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/useractivitylog?userId=${userId || 0}`,
    {
      next: { tags: ["userActivityLog"] },
    }
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
