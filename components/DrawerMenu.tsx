'use state';

import { Transition, Dialog } from '@headlessui/react';
import Link from 'next/link';
import { Fragment, SVGProps, useContext } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ConnectionIcon } from './icons/ConnectionIconIcon';
import { ExploreIcon } from './icons/ExploreIcon';

interface Props {
  close: () => void;
  open: boolean;
}

export function DrawerMenu({ close, open }: Props) {
  return (
    <Transition show={open}>
      <Dialog as='div' open={open} onClose={close} className='fixed inset-0 z-40'>
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <Transition
          as={Fragment}
          enter='ease-in-out duration-300'
          enterFrom='-translate-x-full'
          enterTo='translate-x-0'
          leave='ease-in-out duration-300'
          leaveFrom='translate-x-0'
          leaveTo='-translate-x-full'>
          <div className='flex flex-col w-64 relative z-10 h-full bg-gray-50 border-r border-gray-200'>
            <button
              type='button'
              className='absolute top-2 right-2 flex items-center justify-center w-10 h-10'
              onClick={close}>
              X
            </button>
            <div className='py-4 px-6 font-bold text-blue-600'>Down The Hall</div>
            <div className='overflow-y-auto flex-1'>
              <div className='flex flex-col space-y-1 px-4'>
                <Link
                  className='flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50'
                  href='/find'>
                  <SearchIcon className='h-5 w-5' />
                  Find
                </Link>
                <Link
                  className='flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50'
                  href='/track'>
                  <BookmarkIcon className='h-5 w-5' />
                  Track
                </Link>
                <Link
                  className='flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50'
                  href='#'>
                  <ConnectionIcon className='h-5 w-5' />
                  Connection
                </Link>
                <Link
                  className='flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50'
                  href='#'>
                  <ExploreIcon className='h-5 w-5' />
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </Transition>
      </Dialog>
    </Transition>
  );
}
