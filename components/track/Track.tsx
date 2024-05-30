'use client';

import { Fragment, useState } from 'react';
import IconButton from '../basicUI/IconButton';
import { CardIcon } from '../icons/CardIcon';
import { ListIcon } from '../icons/ListIcon';
import { ShelfIcon } from '../icons/ShelfIcon';
import {
  Listbox,
  ListboxButton,
  Transition,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CheckIcon } from '../icons/CheckIcon';
import FilterTrack from './_FilterTracking';

const options = [{ name: 'Book Length' }, { name: 'Book Title' }, { name: 'Last Read' }];

export default function Track() {
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

      <p> actually list books</p>
    </div>
  );
}
