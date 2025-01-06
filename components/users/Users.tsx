import { SelectBook, SelectUser } from "@/lib/schema";
import Image from "next/image";

export interface GridUsers {
  user: SelectUser;
  currentlyReading: SelectBook;
}

interface UserGridProps {
  users: GridUsers[];
}

export default function UserGrid({ users }: UserGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <div
            key={user.user.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <div className="relative h-48">
              <img
                src={user.user.image || ""}
                alt={`${user.user.userName}'s photo`}
                className="transition-opacity duration-300 ease-in-out hover:opacity-90 object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {user.user.userName}
              </h2>
              <p className="text-sm text-gray-600">
                Currently reading:{" "}
                <span className="font-medium text-indigo-600">
                  {user.currentlyReading.title}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
