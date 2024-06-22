'use client';

import { useState } from 'react';
import Button from '../basicUI/Button';

export default function Find() {
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
                } />
        </div>
      </div>
      <div className='lg:col-span-4 relative'>Content</div>
    </div>
  );
}
