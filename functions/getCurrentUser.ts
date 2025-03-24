export async function getCurrentUser(userId: string | undefined) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`;

  // Remove the conflicting cache options
  const response = await fetch(apiUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}
