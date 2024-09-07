import { addBook } from "@/actions/bookActions";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import clsx from "clsx";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { Status } from "@/types/statusEnum";
import { addBookToList } from "@/functions/addBook";

interface Props {
  title: string;
  author: string;
  image: string;
  release_year: string;
  default_physical_edition_id: number;
  description: string;
  series_position: number;
  series_length: number;
  series_name: string;
  hardcover_id: number;
  page_number: number;
  buttonText: string;
}

export function AddToListButton({
  title,
  author,
  image,
  release_year,
  default_physical_edition_id,
  description,
  series_position,
  series_length,
  series_name,
  hardcover_id,
  buttonText,
  page_number,
}: Props) {
  const readingStatusString: string[] = ["Reading", "Read", "TBR", "DNF"];

  const listOptions = Object.keys(Status)
    .map((key, index) => {
      if (!isNaN(Number(key))) {
        return { id: key, displayString: readingStatusString[index] };
      }
    })
    .filter((item) => item !== undefined);

  return (
    <Listbox
      value={{ id: 0, displayString: "temp" }}
      onChange={(e) => {
        addBookToList(
          title,
          author,
          "",
          e.id,
          image,
          release_year,
          default_physical_edition_id,
          description,
          series_position,
          series_length,
          series_name,
          hardcover_id,
          page_number
        );
      }}
    >
      <ListboxButton
        className={clsx(
          "bg-primary flex items-center justify-center p-4 rounded-lg  text-sm/6 gap-2 text-white",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
        )}
      >
        {buttonText}
        <ChevronDownIcon
          className="group pointer-events-none size-4 fill-white/60"
          aria-hidden="true"
        />
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        className={clsx(
          "w-[var(--button-width)] rounded-xl border border-white/5  p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none bg-primary mt-2",
          "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
        )}
      >
        {listOptions.map((listName) => {
          return (
            <ListboxOption
              key={listName?.displayString}
              value={listName}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
              <div className="text-sm/6 text-white">
                {listName?.displayString}
              </div>
            </ListboxOption>
          );
        })}
      </ListboxOptions>
    </Listbox>
  );
}
