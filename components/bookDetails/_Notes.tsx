"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addBookNote } from "@/functions/addBookNote";
import { InsertBookNote, SelectBookNote } from "@/lib/schema";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";

const fetchNotes = async (): Promise<SelectBookNote[]> => {
  // Simulating API call
  return [
    {
      id: 1,
      userId: "user1",
      bookId: 1,
      updatedDate: new Date(),
      note: "First note",
      pageNumber: 10,
      series: "Series A",
    },
    {
      id: 2,
      userId: "user1",
      bookId: 1,
      updatedDate: new Date(),
      note: "Second note",
      pageNumber: 20,
      series: "Series A",
    },
  ];
};

interface Props {
  bookId: number;
}

export default function Notes({ bookId }: Props) {
  const [notes, setNotes] = useState<SelectBookNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [pageNumber, setPageNumber] = useState<number | null>(null);
  useEffect(() => {
    const loadNotes = async () => {
      const fetchedNotes = await fetchNotes();
      setNotes(fetchedNotes);
    };
    loadNotes();
  }, []);

  const handleAddNote = async () => {
    if (newNote.trim() === "") return;

    const noteToAdd: Omit<InsertBookNote, "id" | "updatedDate"> = {
      userId: "user1", // Replace with actual user ID
      bookId: bookId,
      note: newNote,
      pageNumber: pageNumber,
      series: "Series A", // Replace with actual series or make it dynamic
    };

    addBookNote(noteToAdd);

    setNewNote("");
    setPageNumber(null);
  };

  return (
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
      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle>Note {note.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{note.note}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Page: {note.pageNumber || "N/A"}</p>
                <p>Series: {note.series || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
