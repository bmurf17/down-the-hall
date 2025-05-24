"use client";

import { Card } from "@/components/ui/card";
import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import CardCarousel from "../shared/CardCarousel";

interface UserGridProps {
  users: userGridResponse[];
}

export default function UserGrid({ users }: UserGridProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent, userId: string) => {
    const target = e.target as Element;

    let currentElement: Element | null = target;
    while (currentElement) {
      if (currentElement.tagName === "BUTTON") {
        e.stopPropagation();
        return;
      }
      currentElement = currentElement.parentElement;
    }

    router.push(`/useractivitylog/${userId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((userData) => (
          <Card
            key={userData.user.id}
            className="p-6 bg-card text-card-foreground cursor-pointer h-full"
            onClick={(e) => handleCardClick(e, userData.user.id)}
          >
            <div className="flex items-center gap-2 mb-4">
              {userData.user.image ? (
                <img
                  src={userData.user.image}
                  alt={userData.user.userName || "User"}
                  className="w-8 h-8 rounded-md"
                />
              ) : (
                <UserIcon className="w-8 h-8" />
              )}
              <span className="text-xl">
                {userData.user.userName || "Anonymous User"}
              </span>
            </div>

            <p className="text mb-4 text-center">Currently Reading</p>

            {userData.books.length > 0 ? (
              <div className="relative w-full">
                <CardCarousel userData={userData} />
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No books currently being read
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
