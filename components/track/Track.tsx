'use client';

import { SelectBook } from '@/lib/schema';
import { useState } from 'react';
import IconButton from '../basicUI/IconButton';
import { CardIcon } from '../icons/CardIcon';
import { ListIcon } from '../icons/ListIcon';
import { ShelfIcon } from '../icons/ShelfIcon';
import FilterTrack from './_FilterTracking';

const options = [{ name: 'Book Length' }, { name: 'Book Title' }, { name: 'Last Read' }];

interface Props {
  books: SelectBook[];
}

export default function Track({ books }: Props) {
  const switchView = () => ({});
  const [selected, setSelected] = useState(options[0]);

  return (
    <div>
      <div className='flex justify-between'>
        <div className='top-16 w-72'>
          <FilterTrack options={options} selected={selected} setSelected={setSelected} />
        </div>
        <div className='flex gap-4'>
          <IconButton icon={<CardIcon />} handleClick={switchView} styles={''} tooltipText='Card' />
          <IconButton icon={<ListIcon />} handleClick={switchView} styles={''} tooltipText='List' />
          <IconButton
            icon={<ShelfIcon />}
            handleClick={switchView}
            styles={''}
            tooltipText='Shelf'
          />
        </div>
      </div>

      {books.map((book) => {
        return <div key={book.id}>{book.title}</div>;
      })}
    </div>
  );
}
