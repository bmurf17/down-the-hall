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
    <Transition.Root show={open}>
      <Dialog as='div' open={open} onClose={close} className='fixed inset-0 z-40'>
        <Transition.Child
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
                  href='#'>
                  <SearchIcon className='h-5 w-5' />
                  Find
                </Link>
                <Link
                  className='flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50'
                  href='#'>
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
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter='transition-opacity ease-linear duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition-opacity ease-linear duration-300'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <Dialog.Overlay className='fixed inset-0 bg-gray-600 bg-opacity-50'></Dialog.Overlay>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}

function BriefcaseIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <path d='M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
      <rect width='20' height='14' x='2' y='6' rx='2' />
    </svg>
  );
}

function ClipboardIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <rect width='8' height='4' x='8' y='2' rx='1' ry='1' />
      <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' />
    </svg>
  );
}

function HomeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
      <polyline points='9 22 9 12 15 12 15 22' />
    </svg>
  );
}

function MailIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <rect width='20' height='16' x='2' y='4' rx='2' />
      <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
    </svg>
  );
}

function MountainIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <path d='m8 3 4 8 5-5 5 15H2L8 3z' />
    </svg>
  );
}
