"use client";
import type { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import type { Book } from "@/types/book";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import TrendingDisplay from "./_TrendingDisplay";
import UserLog from "./_UserLog";

import { ScrollArea } from "@/components/ui/scroll-area";
import CurrentlyReadingCard from "./_CurrentlyReadingCard";
import { ProgressTracker } from "../goals/_ProgressTracker";
import { userGridResponse } from "@/types/apiResponse/usersgridResponse";

interface Props {
  books: Book[];
  userActivityLog: UserActivityLogList;
  currentlyReading?: userGridResponse; // Add this prop for the currently reading book
  goals?: any[]; // Add this prop for goals data
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CentralDisplay({
  books,
  userActivityLog,
  currentlyReading,
  goals = [],
}: Props) {
  const [tabs] = useState({
    Trending: [
      {
        id: 1,
        title: "Does drinking coffee make you smarter?",
        date: "5h ago",
        commentCount: 5,
        shareCount: 2,
      },
      {
        id: 2,
        title: "So you've bought coffee... now what?",
        date: "2h ago",
        commentCount: 3,
        shareCount: 2,
      },
    ],
    "Your Feed": [
      {
        id: 1,
        title: "Is tech making coffee better or worse?",
        date: "Jan 7",
        commentCount: 29,
        shareCount: 16,
      },
      {
        id: 2,
        title: "The most innovative things happening in coffee",
        date: "Mar 19",
        commentCount: 24,
        shareCount: 12,
      },
    ],
  });

  return (
    <div className="w-full px-2 py-2 sm:px-0">
      {/* Main grid layout - on desktop: left column for Currently Reading and Goals, right column for Trending */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column - stacks on mobile */}
        <div className="flex flex-col gap-4 order-1 md:order-1">
          {/* Currently Reading Section */}

          {currentlyReading ? (
            <CurrentlyReadingCard userData={currentlyReading} />
          ) : (
            <div className="text-muted-foreground">
              No book currently being read
            </div>
          )}

          {/* Goals Section */}
          <div className="bg-card rounded-xl p-4">
            <h2 className="text-xl font-medium mb-3">Goals</h2>
            <ProgressTracker goal={10} completed={6} />
          </div>
        </div>

        {/* Right column - Trending section with tabs */}
        <div className="md:h-[calc(100vh-150px)] order-3 md:order-2 col-span-2">
          <TabGroup>
            <TabList className="flex space-x-1 rounded-xl bg-card p-1">
              {Object.keys(tabs).map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                      "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                      selected
                        ? "bg-white text-blue-700 shadow"
                        : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="mt-2">
              <TabPanel
                className={classNames(
                  "rounded-xl bg-card p-3 animate-fade-in-grow h-full",
                  "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                )}
              >
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <TrendingDisplay books={books} />
                </ScrollArea>
              </TabPanel>

              <TabPanel
                className={classNames(
                  "rounded-xl bg-card p-3 animate-fade-in-grow h-full",
                  "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                )}
              >
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <UserLog userActivityLog={userActivityLog} />
                </ScrollArea>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}
