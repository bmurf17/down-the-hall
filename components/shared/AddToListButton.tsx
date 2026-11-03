import React, { useState } from "react";
import { addBookToList } from "@/functions/addBook";
import { editBookToList } from "@/functions/editBook";
import { useToast } from "@/hooks/use-toast";
import { Status, readingStatusString } from "@/types/enums/statusEnum";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  author: string;
  image: string;
  release_year: string;
  default_physical_edition_id: number;
  description: string;
  series_position: string;
  series_length: number;
  series_name: string;
  hardcover_id: number;
  page_number: number;
  buttonText: string;
  id: number;
  rating: string;
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
  id,
  rating,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const listOptions = Object.values(Status)
    .filter((value): value is number => typeof value === "number")
    .map((value) => ({
      id: value,
      displayString: readingStatusString[value],
    }));

  const handleChange = async (e: { id: number; displayString: string }) => {
    setIsLoading(true);
    try {
      if (id) {
        await editBookToList(id, title, e.id, rating, page_number);
        router.refresh();
      } else {
        await addBookToList(
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

        toast({
          title: "Successfully Added Book",
          description: `${title} was added`,
        });

        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Listbox
      value={{ id: 0, displayString: "temp" }}
      onChange={handleChange}
      disabled={isLoading}
    >
      <ListboxButton
        className={cn(
          buttonVariants({ size: "lg" }),
          "p-4 text-sm/6 hover:bg-opacity-40",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            {buttonText}
            <ChevronDownIcon
              className="group pointer-events-none size-4 fill-white/60"
              aria-hidden="true"
            />
          </>
        )}
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        className={cn(
          "rounded-xl border border-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none bg-primary mt-2 w-fit",
          "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
        )}
      >
        {listOptions.map((listName) => (
          <ListboxOption
            key={listName?.displayString}
            value={listName}
            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            disabled={isLoading}
          >
            <div className="text-sm/6 text-white">
              {listName?.displayString}
            </div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
