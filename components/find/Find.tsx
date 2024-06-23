'use client';

import { useState } from 'react';
import Button from '../basicUI/Button';
import { GoogleBooksResponse } from '@/types/googlebookresponse';

interface Props {
  books: GoogleBooksResponse;
}

export default function Find(books: Props) {
  const viewOptions = ['Card', 'List', 'Shelf'];
  const [selectedView, setSelectedView] = useState<string | undefined>(viewOptions[0]);

  const clear = () => ({});

  return (
    <div className='flex flex-col lg:grid lg:grid-cols-5 relative gap-2 lg:gap-4'>
      <div className='relative col-span-1'>
        <div className='flex gap-2 items-center'>
          <div className='font-medium text-lg'>Filters</div>
          <Button
            text={'Clear'}
            handleClick={clear}
            styles={
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border rounded-lg active:translate-y-1 transition-all bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white py-2 px-2 active:shadow-none gap-2'
            }
          />
        </div>
      </div>
      <div className='lg:col-span-4 relative'>
        <div className='flex border-2 border-gray-200 p-4 rounded-xl mb-2'>
            Search
        </div>
        <div className='flex flex-col gap-4'>
          {books.books.items.map((volume, i) => {
            return (
              <div
                className='flex justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer'
                key={volume.volumeInfo.title + i}>
                <div className='flex  gap-2'>
                  <div>
                    <img
                      className='relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block'
                      src={volume.volumeInfo.imageLinks.thumbnail || ''}
                      alt={volume.volumeInfo.title}
                      height={100}
                      width={100}
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className='font-serif text-yellow-500 dark:text-yellow-50 underline-offset-4 text-lg no-underline hover:underline decoration-gray-300 dark:decoration-gray-500'>
                      {volume.volumeInfo.title}
                    </div>
                    <div className='text-md'>By: {volume.volumeInfo.authors[0]}</div>
                    <div className='text-gray-600 dark:text-gray-400 text-sm font-semibold'>
                      {' '}
                      {volume.volumeInfo.categories}
                    </div>
                    <div className='text-gray-600 dark:text-gray-400 text-sm font-semibold'>
                      Page Count: {volume.volumeInfo.pageCount}
                    </div>
                  </div>
                </div>

                <div className='flex self-end'>
                  <Button
                    text={'Want To Read'}
                    handleClick={() => {
                    }}
                    styles={'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border rounded-lg active:translate-y-1 transition-all bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white py-2 px-2 active:shadow-none gap-2'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
