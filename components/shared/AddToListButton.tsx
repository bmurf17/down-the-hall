import { addBook } from '@/actions/bookActions';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import clsx from 'clsx';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { Status } from '@/types/statusEnum';

interface Props {
    title: string
    author: string
    image: string
    addBookToList: (title: string, author: string, authorImg: string, status: number, image: string) => void

}

export function AddToListButton({title, author, image, addBookToList} : Props){
    const readingStatusString: string[] = ['Reading', 'Read', 'TBR', 'DNF'];

    const listOptions = Object.keys(Status)
      .map((key, index) => {
        if (!isNaN(Number(key))) {
          return { id: key, displayString: readingStatusString[index] };
        }
      })
      .filter((item) => item !== undefined);


    return (
        <Listbox
          value={{ id: 0, displayString: 'temp' }}
          onChange={(e) => {
            addBookToList(title, author, "", e.id, image)
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
    )
}