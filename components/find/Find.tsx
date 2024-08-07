'use client';

import { addBook } from '@/actions/bookActions';
import { HardCoverApiResponse } from '@/types/hardcoverresponse';
import { Status } from '@/types/statusEnum';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import Button from '../basicUI/Button';
import { AddToListButton } from '../shared/AddToListButton';

interface Props {
  books: HardCoverApiResponse;
}

export default function Find(books: Props) {
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

  const addBookToList = (
    title: string,
    author: string,
    authorImg: string,
    status: number,
    image: string,
    release_year: string,
    default_physical_edition_id: number,
    description: string,
    series_position: number,
    series_length: number,
    series_name: string,
    hardcover_id: number
  ) => {
    addBook(
      title,
      author,
      '',
      status,
      image,
      release_year,
      default_physical_edition_id,
      description,
      series_position,
      series_length,
      series_name,
      hardcover_id
    );
  };

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
          {books?.books?.data?.books !== undefined ? (
            <>
              {' '}
              {books.books.data.books.map((book, i) => {
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
                                Page Count:{' '}
                                {
                                  book.editions.filter(
                                    (x: { id: any }) => x.id === book.default_physical_edition_id
                                  )[0].pages
                                }
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className='flex self-end'>
                        <AddToListButton
                          title={book.title}
                          author={
                            book.book_series.length > 0
                              ? book.book_series[0]?.series.author.name
                              : ''
                          }
                          image={book.image.url}
                          default_physical_edition_id={book.default_physical_edition_id}
                          description={book.description ?? ''}
                          hardcover_id={book.id}
                          release_year={book.release_year}
                          series_length={book.book_series.length > 0 ? book.book_series[0].series.books_count : 0}
                          series_name={book.book_series.length > 0 ? book.book_series[0].series.name : ""}
                          series_position={book.book_series.length > 0 ? book.book_series[0].position || 0 : 0}
                          addBookToList={addBookToList}
                        />
                      </div>
                    </div>
                  );
              })}{' '}
            </>
          ) : (
            <> Search to see results</>
          )}
        </div>
      </div>
    </div>
  );
}
