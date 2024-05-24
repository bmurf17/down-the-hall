'use client';

import IconButton from './basicUI/IconButton';
import { CardIcon } from './icons/CardIcon';
import { ListIcon } from './icons/ListIcon';
import { ShelfIcon } from './icons/ShelfIcon';

export default function Track() {
  const switchView = () => ({});
  return (
    <div>
      <div className='flex justify-between'>
        <div>sort</div>
        <div className='flex gap-4'>
          <IconButton icon={<CardIcon />} handleClick={switchView} styles={''} tooltipText='Card'/>
          <IconButton icon={<ListIcon />} handleClick={switchView} styles={''} tooltipText='List'/>
          <IconButton icon={<ShelfIcon />} handleClick={switchView} styles={''} tooltipText='Shelf'/>

        </div>
      </div>
    </div>
  );
}
