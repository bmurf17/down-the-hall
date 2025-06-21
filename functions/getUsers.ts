export async function getUsers() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

  const response = await fetch(apiUrl, {
    cache: "no-store",
    next: {
      tags: ["user-data", `user`],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}
