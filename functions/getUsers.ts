export async function getUsers() {
  console.log('FETCHING USERS AT:', new Date().toISOString());
  
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
  console.log('RECEIVED USERS:', data.length, 'users');
  return data;
}