import Users, { GridUsers } from "@/components/users/Users";
import { currentUser } from "@clerk/nextjs/server";

export const tempGridUsers: GridUsers[] = [
  {
    user: {
      id: "user1",
      image:
        "https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg",
      userName: "Alice",
      lastLoggedIn: new Date("2025-01-01T10:00:00"),
    },
    currentlyReading: {
      id: 1,
      userId: "user1",
      title: "Book Title 1",
      authorId: 101,
      image:
        "https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg",
      status: 1,
      releaseYear: 2021,
      defaultPhysicalEditionId: 201,
      description: "A thrilling adventure story.",
      seriesPosition: "1.1",
      seriesLength: 3,
      seriesName: "Adventure Series",
      pageCount: 300,
      genres: ["Adventure", "Fantasy"],
      hardcoverId: 301,
      dateRead: null,
      updatedDate: new Date("2025-01-01").toDateString(),
      rating: "4.5",
    },
  },
  {
    user: {
      id: "user2",
      image:
        "https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg",
      userName: "Bob",
      lastLoggedIn: new Date("2025-01-02T14:00:00"),
    },
    currentlyReading: {
      id: 2,
      userId: "user2",
      title: "Book Title 2",
      authorId: 102,
      image: "https://example.com/book2.jpg",
      status: 2,
      releaseYear: 2020,
      defaultPhysicalEditionId: 202,
      description: "A deep dive into science.",
      seriesPosition: null,
      seriesLength: null,
      seriesName: null,
      pageCount: 250,
      genres: ["Science", "Non-Fiction"],
      hardcoverId: 302,
      dateRead: new Date("2025-01-01").toDateString(),
      updatedDate: new Date("2025-01-03").toDateString(),
      rating: "4.0",
    },
  },
  {
    user: {
      id: "user3",
      image:
        "https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg",
      userName: "Charlie",
      lastLoggedIn: new Date("2025-01-03T18:30:00"),
    },
    currentlyReading: {
      id: 3,
      userId: "user3",
      title: "Book Title 3",
      authorId: 103,
      image: "https://example.com/book3.jpg",
      status: 1,
      releaseYear: 2019,
      defaultPhysicalEditionId: 203,
      description: "A gripping mystery novel.",
      seriesPosition: "1",
      seriesLength: 2,
      seriesName: "Mystery Series",
      pageCount: 320,
      genres: ["Mystery", "Thriller"],
      hardcoverId: 303,
      dateRead: null,
      updatedDate: new Date("2025-01-02").toISOString(),
      rating: "5.0",
    },
  },
  {
    user: {
      id: "user4",
      image:
        "https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg",
      userName: "Danny",
      lastLoggedIn: new Date("2025-01-03T18:30:00"),
    },
    currentlyReading: {
      id: 4,
      userId: "user4",
      title: "Book Title 4",
      authorId: 103,
      image: "https://example.com/book3.jpg",
      status: 1,
      releaseYear: 2019,
      defaultPhysicalEditionId: 203,
      description: "A gripping mystery novel.",
      seriesPosition: "1",
      seriesLength: 2,
      seriesName: "Mystery Series",
      pageCount: 320,
      genres: ["Mystery", "Thriller"],
      hardcoverId: 303,
      dateRead: null,
      updatedDate: new Date("2025-01-02").toISOString(),
      rating: "5.0",
    },
  },
];

export default async function StatsPage() {
  const user = await currentUser();

  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">User not logged in</p>
      </div>
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stats/${user.id}`
  );
  if (!response.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="mx-16 ">
      <Users users={tempGridUsers} />
    </div>
  );
}
