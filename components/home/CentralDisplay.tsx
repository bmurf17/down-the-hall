"use client";
import type { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import type { Book } from "@/types/book";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import TrendingDisplay from "./_TrendingDisplay";
import UserLog from "./_UserLog";

import { ScrollArea } from "@/components/ui/scroll-area";
import CurrentlyReadingCard from "./_CurrentlyReadingCard";
import { ProgressTracker } from "../goals/_ProgressTracker";
import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { SelectGoal } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

interface Props {
  books: Book[];
  userActivityLog: UserActivityLogList;
  currentlyReading?: userGridResponse | null;
  goals?: SelectGoal[];
  completedBooksLength?: number;
}

export default function CentralDisplay({
  books,
  userActivityLog,
  currentlyReading,
  goals = [],
  completedBooksLength,
}: Props) {
  const TABS = ["Trending", "Your Feed"] as const; 
  return (
    <div className="w-full px-3 py-3 sm:px-0">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4">
          {currentlyReading ? (
            <CurrentlyReadingCard userData={currentlyReading} />
          ) : (
            <Card className="p-4 text-center text-sm text-muted-foreground">
              No book currently being read
            </Card>
          )}

          <Card className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Goals</h2>
            <ProgressTracker
              goal={goals.at(-1)?.bookCount ?? 0}
              completed={completedBooksLength ?? 0}
            />
          </Card>
        </div>

        <div className="min-w-0 lg:col-span-2">
          <TabGroup>
            <TabList className="flex gap-1 rounded-xl bg-card p-1">
              {TABS.map((name) => (
                <Tab
                  key={name}
                  className={({ selected }) =>
                    cn(
                      "min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  {name}
                </Tab>
              ))}
            </TabList>

            <TabPanels className="mt-2">
              <TabPanel className="rounded-xl bg-card p-3 motion-safe:animate-fade-in-grow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="lg:max-h-[calc(100dvh-14rem)] lg:overflow-y-auto">
                  <TrendingDisplay books={books} />
                </div>
              </TabPanel>

              <TabPanel className="rounded-xl bg-card p-3 motion-safe:animate-fade-in-grow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="lg:max-h-[calc(100dvh-14rem)] lg:overflow-y-auto">
                  <UserLog userActivityLog={userActivityLog} />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}
