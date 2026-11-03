import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { addBookToList } from "@/functions/addBook";
import { editBookToList } from "@/functions/editBook";
import { useToast } from "@/hooks/use-toast";
import { Status, readingStatusString } from "@/types/enums/statusEnum";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  title: string;
  author: string;
  authorImg?: string;
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
  currentStatus?: number | null; // pass book.book?.status
  className?: string;
}

const LIST_OPTIONS = Object.values(Status)
  .filter((v): v is number => typeof v === "number")
  .map((id) => ({ id, label: readingStatusString[id] }));

export function AddToListButton({
  title,
  author,
  authorImg,
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
  currentStatus,
  className,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const busy = isLoading || isPending;

  const handleChange = async (statusId: number) => {
    if (statusId === currentStatus) return;
    setIsLoading(true);
    try {
      if (id) {
        await editBookToList(id, title, statusId, rating, page_number);
        toast({
          title: "Status updated",
          description: `${title} moved to ${readingStatusString[statusId]}`,
        });
      } else {
        await addBookToList(
          title,
          author,
          authorImg ?? "",
          statusId,
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
        toast({ title: "Book added", description: `${title} was added` });
      }
      startTransition(() => router.refresh()); // stays "busy" until fresh data lands
    } catch {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={busy}
          aria-busy={busy}
          className={cn("min-h-11 md:min-h-9", className)}
        >
          {buttonText}
          {/* spinner replaces the chevron, so the button never changes width */}
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ChevronDown className="size-4 opacity-70" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup
          value={currentStatus == null ? "" : String(currentStatus)}
          onValueChange={(v: any) => handleChange(Number(v))}
        >
          {LIST_OPTIONS.map((o) => (
            <DropdownMenuRadioItem
              key={o.id}
              value={String(o.id)}
              className="min-h-11 md:min-h-8"
            >
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
