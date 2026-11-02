import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import clsx from "clsx";
import ActivityLog from "../shared/ActivityLog";
import { Button } from "../ui/button";

interface Props {
  userActivityLog: UserActivityLogList;
}

export default function UserLog({ userActivityLog }: Props) {
  return (
    <>
      <SignedIn>
        <ActivityLog activityLog={userActivityLog} />
      </SignedIn>

      <SignedOut>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to start tracking your books
          </p>
          <SignInButton>
            <Button className="min-h-11 w-full sm:w-auto sm:min-w-32">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
