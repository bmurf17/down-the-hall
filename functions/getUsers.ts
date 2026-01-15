export async function getUsers() {  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

  const response = await fetch(apiUrl, {
    cache: "no-store",
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();
  return data;
}