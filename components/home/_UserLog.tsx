import { UserActivityLogReturnType } from "@/app/page";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import clsx from "clsx";
import ActivityLog from "../shared/ActivityLog";

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
        <div className="flex flex-col gap-4">
          <p>Sign in to start traking your book</p>
          <SignInButton>
            <button
              className={clsx(
                "bg-primary flex items-center justify-center p-2 rounded-lg  text-sm/6 gap-2 text-white hover:bg-green-500",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
              )}
            >
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
