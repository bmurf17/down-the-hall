'use client';

import { useState } from 'react';
import IconButton from '../basicUI/IconButton';
import { CardIcon } from '../icons/CardIcon';
import { ListIcon } from '../icons/ListIcon';
import { ShelfIcon } from '../icons/ShelfIcon';
import BookCardView from './_BookCardView';
import FilterTrack from './_FilterTracking';
import { Book } from '@/types/book';
import BookShelfView from './_BookShelfView';
import BookListView from './_BookListView';

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

  return (
    <div>
      <div className='flex justify-between'>
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

      <div className='mt-4'>
        {selectedView === viewOptions[0] ? (
          <div className='flex flex-col gap-2'>
            {books.map((book) => {
              return <BookCardView key={book.book.id} book={book} />;
            })}
          </div>
        ) : (
          <>
            {selectedView === viewOptions[1] ? (
              <div className='flex flex-col gap-2'>
                {books.map((book) => {
                  return <BookListView key={book.book.id} book={book} />;
                })}
              </div>
            ) : (
              <div className='mt-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2'>
                {books.map((book) => {
                  return <BookShelfView key={book.book.id} book={book} />;
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
