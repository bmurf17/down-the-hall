'use client';

import { Book } from '@/types/book';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import IconButton from '../basicUI/IconButton';
import { CardIcon } from '../icons/CardIcon';
import { ListIcon } from '../icons/ListIcon';
import { ShelfIcon } from '../icons/ShelfIcon';
import FilterTrack from './_FilterTracking';
import TrackBooViewLogic from './_TrackBookViewLogic';

const options = [{ name: 'Book Length' }, { name: 'Book Title' }, { name: 'Last Read' }];

interface Props {
  books: Book[];
}

export default function Track({ books }: Props) {
  const switchView = (toolName: string) =>
    setSelectedView(viewOptions.find((tool) => tool === toolName));
  const [selected, setSelected] = useState(options[0]);
  const viewOptions = ['Card', 'List', 'Shelf'];
  const [selectedView, setSelectedView] = useState<string | undefined>(viewOptions[0]);

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
 
      return params.toString()
    },
    [searchParams]
  )

  return (
    <div>
      <div>
        <TabGroup>
          <TabList className='flex gap-4'>
            <Tab
              className='data-[selected]:bg-indigo-600 text-white rounded-xl p-4 data-[hover]:bg-indigo-400 data-[selected]:data-[hover]:bg-indigo-500 data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400'
              onClick={() => {
                router.push(pathname + '?' + createQueryString('status', ""))
              }}
              >
              All
            </Tab>
            <Tab
              className='data-[selected]:bg-indigo-600 text-white rounded-xl p-4 data-[hover]:bg-indigo-400 data-[selected]:data-[hover]:bg-indigo-500 data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400'
              onClick={() => {
                router.push(pathname + '?' + createQueryString('status', "0"))
              }}
              >
              Currently Reading
            </Tab>
            <Tab
              className='data-[selected]:bg-indigo-600 text-white rounded-xl p-4 data-[hover]:bg-indigo-400 data-[selected]:data-[hover]:bg-indigo-500 data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400'
              onClick={() => {
                router.push(pathname + '?' + createQueryString('status', "1"))
              }}>
              Read
            </Tab>
            <Tab
              className='data-[selected]:bg-indigo-600 text-white rounded-xl p-4 data-[hover]:bg-indigo-400 data-[selected]:data-[hover]:bg-indigo-500 data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400'
              onClick={() => {
                router.push(pathname + '?' + createQueryString('status', "2"))
              }}
              >
              Want To Read
            </Tab>
            <Tab
              className='data-[selected]:bg-indigo-600 text-white rounded-xl p-4 data-[hover]:bg-indigo-400 data-[selected]:data-[hover]:bg-indigo-500 data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400'
              onClick={() => {
                router.push(pathname + '?' + createQueryString('status', "3"))
              }}
              >
              Did Not Finish
            </Tab>
          </TabList>

          <div className='flex justify-between mt-4'>
            <div className='top-16 w-72'>
              <FilterTrack options={options} selected={selected} setSelected={setSelected} />
            </div>
            <div className='flex gap-4'>
              <IconButton
                icon={<CardIcon />}
                handleClick={() => {
                  switchView(viewOptions[0]);
                }}
                styles={''}
                tooltipText={viewOptions[0]}
                active={selectedView === viewOptions[0]}
              />
              <IconButton
                icon={<ListIcon />}
                handleClick={() => {
                  switchView(viewOptions[1]);
                  console.log();
                }}
                styles={''}
                tooltipText={viewOptions[1]}
                active={selectedView === viewOptions[1]}
              />
              <IconButton
                icon={<ShelfIcon />}
                handleClick={() => {
                  switchView(viewOptions[2]);
                }}
                styles={''}
                tooltipText={viewOptions[2]}
                active={selectedView === viewOptions[2]}
              />
            </div>
          </div>
          {/* TODO actually filer what we send to book display based on which tab is displayed */}
          <TabPanels>
            <TabPanel>
              <TrackBooViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBooViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBooViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBooViewLogic
                selectedView={selectedView}
                books={books}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBooViewLogic
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
