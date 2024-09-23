"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";
import { InsertBookNote, SelectBookNote } from "@/lib/schema";
import { addNote } from "@/actions/noteActions";
import { addBookNote } from "@/functions/addBookNote";

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

    console.log("HERE");

    const noteToAdd: Omit<InsertBookNote, "id" | "updatedDate"> = {
      userId: "user1", // Replace with actual user ID
      bookId: bookId, // Replace with actual book ID
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
        <Button onClick={handleAddNote}>Add Note</Button>
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
