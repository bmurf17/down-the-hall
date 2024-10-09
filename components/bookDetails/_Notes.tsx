"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addBookNote } from "@/functions/addBookNote";
import { InsertBookNote } from "@/lib/schema";
import { Book } from "@/types/book";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

interface Props {
  dbBookInfo: Book | null;
}

export default function Notes({ dbBookInfo }: Props) {
  const [newNote, setNewNote] = useState("");
  const [pageNumber, setPageNumber] = useState<number | null>(null);

  const router = useRouter();

  const handleAddNote = async () => {
    if (newNote.trim() === "") return;

    const noteToAdd: Omit<InsertBookNote, "id" | "updatedDate" | "userId"> = {
      bookId: dbBookInfo?.book?.id,
      note: newNote,
      pageNumber: pageNumber,
      series: dbBookInfo?.book?.seriesName,
    };

    addBookNote(noteToAdd, dbBookInfo?.book?.hardcoverId || 0);

    setNewNote("");
    setPageNumber(null);

    router.refresh();
  };
  return (
    <>
      <>
        <div className="max-w-2xl mx-4 p-4">
          <div className="mb-4 space-y-2">
            <Textarea
              placeholder="Enter your note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Page number (optional)"
              value={pageNumber || ""}
              onChange={(e) =>
                setPageNumber(e.target.value ? parseInt(e.target.value) : null)
              }
            />
            <div className="flex justify-end">
              <Button
                className={clsx(
                  "bg-primary flex items-center justify-center p-4 rounded-lg  text-sm/6 gap-2 text-white",
                  "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                )}
                onClick={handleAddNote}
              >
                Add Note
              </Button>
            </div>
          </div>
          {(dbBookInfo?.book_notes || []).length > 0 ? (
            <div className="space-y-4">
              {dbBookInfo?.book_notes?.map((note) => (
                <Card key={note?.id}>
                  <CardHeader>
                    <CardTitle>Note {note?.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{note?.note}</p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Page: {note?.pageNumber || "N/A"}</p>
                      <p>Series: {note?.series || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>You have no notes on this book</>
          )}
        </div>
      </>
    </>
  );
}
