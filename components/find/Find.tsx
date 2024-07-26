'use client';

import { GoogleBooksResponse } from '@/types/googlebookresponse';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import Button from '../basicUI/Button';
import { addBook } from '@/actions/bookActions';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import clsx from 'clsx';
import { CheckIcon } from '../icons/CheckIcon';
import { Status } from '@/types/statusEnum';
import Link from 'next/link';
import { HardCoverApiResponse } from '@/types/hardcoverresponse';

interface Props {
  books: HardCoverApiResponse;
}

export const readingStatusString: string[] = ['Reading', 'Read', 'TBR', 'DNF'];

const listOptions = Object.keys(Status)
  .map((key, index) => {
    if (!isNaN(Number(key))) {
      return { id: key, displayString: readingStatusString[index] };
    }
  })
  .filter((item) => item !== undefined);

export default function Find(books: Props) {
  console.log(books)


  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

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
        <div className='flex justify-center gap-2 align-middle'>
          <input
            className='flex border-2 border-gray-200 p-4 rounded-xl mb-2 w-full'
            placeholder='Search'
            onChange={(e) => {
              router.push(pathname + '?' + createQueryString('title', e.target.value));
            }}
          />
        </div>

        <div className='flex flex-col gap-4'>
          {books.books.data.books.map((book, i) => {
            if(i == 0){
              console.log(book)

            }



            if (book.image)
              return (
                <div
                  className='flex justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer'
                  key={book.title + i}>
                  <Link href={`book/${book.id}`}>
                    <div className='flex gap-2'>
                      <div>
                        <img
                          className='relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block'
                          src={book.image.url}
                          alt={book.title}
                          height={100}
                          width={100}
                        />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='font-serif text-yellow-500 dark:text-yellow-50 underline-offset-4 text-lg no-underline hover:underline decoration-gray-300 dark:decoration-gray-500'>
                          {book.title}
                        </div>
                        {book.book_series.length > 0 ? (
                          <div className='text-md'>
                            By: {book.book_series[0].series.author?.name}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className='text-gray-600 dark:text-gray-400 text-sm font-semibold'>
                          Category
                        </div>

                        {book.editions.length > 0 ? (
                          <div className='text-gray-600 dark:text-gray-400 text-sm font-semibold'>
                            Page Count: {book.editions.filter(x => x.id === book.default_physical_edition_id)[0].pages}
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className='flex self-end'>
                    <Listbox
                      value={{ id: 0, displayString: 'temp' }}
                      onChange={(e) => {
                        addBook(
                          book.title,
                          book.book_series[0].series?.author?.name,
                          '',
                          e.id,
                          book.image?.url || ""
                        );
                      }}>
                      <ListboxButton
                        className={clsx(
                          'bg-indigo-600 relative block w-full rounded-lg py-1.5 pr-8 pl-3 text-left text-sm/6 text-white',
                          'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                        )}>
                        Add To List
                        <ChevronDownIcon
                          className='group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60'
                          aria-hidden='true'
                        />
                      </ListboxButton>
                      <ListboxOptions
                        anchor='bottom'
                        transition
                        className={clsx(
                          'w-[var(--button-width)] rounded-xl border border-white/5  p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none bg-indigo-400 mt-2',
                          'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                        )}>
                        {listOptions.map((listName) => {
                          return (
                            <ListboxOption
                              key={listName?.displayString}
                              value={listName}
                              className='group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10'>
                              <div className='text-sm/6 text-white'>{listName?.displayString}</div>
                            </ListboxOption>
                          );
                        })}
                      </ListboxOptions>
                    </Listbox>
                  </div>
                </div>
              );
          })}
        </div>
      </div>
    </div>
  );
}
