import { SelectBook, SelectUser } from "@/lib/schema";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";

export interface GridUsers {
  user: SelectUser;
  currentlyReading: SelectBook;
}

interface UserGridProps {
  users: GridUsers[];
}

export default function UserGrid({ users }: UserGridProps) {
  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.user.id} className="p-6 bg-card text-card-foreground">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={user.user.image || ""}
                alt={user.user.userName + ""}
                className="w-8 h-8 rounded-md"
              />
              <span className="text-xl">{user.user.userName}</span>
            </div>

            <p className="text mb-4 text-center">Currently Reading</p>

            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-black p-2">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="mx-12">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/427945_Dawnshard.jpeg?alt=media&token=85dc90d4-6360-49b3-91d6-3683f5213ecc"
                  alt={user.currentlyReading.title + ""}
                  className="aspect-[4/3] rounded  flex items-center justify-center mb-2 object-contain"
                ></img>

                <h3 className="text-center font-medium">
                  {user.currentlyReading.title}
                </h3>
              </div>

              <button className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-black p-2">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
