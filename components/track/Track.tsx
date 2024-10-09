"use client";

import { Book } from "@/types/book";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import IconButton from "../basicUI/IconButton";
import { CardIcon } from "../icons/CardIcon";
import { ListIcon } from "../icons/ListIcon";
import { ShelfIcon } from "../icons/ShelfIcon";
import FilterTrack from "./_FilterTracking";
import TrackBookViewLogic from "./_TrackBookViewLogic";

const options = [
  { name: "Book Length" },
  { name: "Book Title" },
  { name: "Last Read" },
];

interface Props {
  books: Book[];
}

export default function Track({ books }: Props) {
  const switchView = (toolName: string) =>
    setSelectedView(viewOptions.find((tool) => tool === toolName));
  const [selected, setSelected] = useState(options[0]);
  const viewOptions = ["Card", "List", "Shelf", "CrazyView"];
  const [selectedView, setSelectedView] = useState<string | undefined>(
    viewOptions[0]
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  return (
    <div>
      <div>
        <TabGroup>
          <TabList className="flex gap-4 w-full sm:mx-auto overflow-x-auto overflow-y-hidden no-scrollbar ">
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-card"
              onClick={() => {
                router.push(pathname + "?" + createQueryString("status", ""));
              }}
            >
              All
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(pathname + "?" + createQueryString("status", "0"));
              }}
            >
              Currently Reading
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(pathname + "?" + createQueryString("status", "1"));
              }}
            >
              Read
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(pathname + "?" + createQueryString("status", "2"));
              }}
            >
              Want To Read
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(pathname + "?" + createQueryString("status", "3"));
              }}
            >
              Did Not Finish
            </Tab>
          </TabList>

          <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
            <div className="top-16 w-72">
              <FilterTrack
                options={options}
                selected={selected}
                setSelected={setSelected}
              />
            </div>
            <div className="flex gap-4">
              <IconButton
                icon={<CardIcon />}
                handleClick={() => {
                  switchView(viewOptions[0]);
                }}
                styles={""}
                tooltipText={viewOptions[0]}
                active={selectedView === viewOptions[0]}
              />
              <IconButton
                icon={<ListIcon />}
                handleClick={() => {
                  switchView(viewOptions[1]);
                }}
                styles={""}
                tooltipText={viewOptions[1]}
                active={selectedView === viewOptions[1]}
              />
              <IconButton
                icon={<ShelfIcon />}
                handleClick={() => {
                  switchView(viewOptions[2]);
                }}
                styles={""}
                tooltipText={viewOptions[2]}
                active={selectedView === viewOptions[2]}
              />

              <IconButton
                icon={<CardIcon />}
                handleClick={() => {
                  switchView(viewOptions[3]);
                }}
                styles={""}
                tooltipText={viewOptions[3]}
                active={selectedView === viewOptions[3]}
              />
            </div>
          </div>
          <TabPanels className="mb-4">
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
