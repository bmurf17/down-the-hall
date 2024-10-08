"use client";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import { Book } from "@/types/book";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import TrendingDisplay from "./_TrendingDisplay";
import UserLog from "./_UserLog";

interface Props {
  books: Book[];
  userActivityLog: UserActivityLogList;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CentralDisplay({ books, userActivityLog }: Props) {
  let [tabs] = useState({
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
    <div className="w-full  px-2 py-2 sm:px-0">
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
              "rounded-xl bg-card p-3 animate-fade-in-grow",
              "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            )}
          >
            <TrendingDisplay books={books} />
          </TabPanel>

          <TabPanel
            className={classNames(
              "rounded-xl bg-card p-3 animate-fade-in-grow",
              "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            )}
          >
            <UserLog userActivityLog={userActivityLog} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
