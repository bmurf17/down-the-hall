"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";

// Define the Note type based on the provided database schema
type Note = {
  id: number;
  userId: string | null;
  bookId: number | null;
  updatedDate: Date;
  note: string;
  pageNumber: number | null;
  series: string | null;
};

// Mock function to fetch notes (replace with actual API call)
const fetchNotes = async (): Promise<Note[]> => {
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

// Mock function to add a new note (replace with actual API call)
const addNote = async (
  note: Omit<Note, "id" | "updatedDate">
): Promise<Note> => {
  // Simulating API call
  return { ...note, id: Date.now(), updatedDate: new Date() };
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
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

    const noteToAdd: Omit<Note, "id" | "updatedDate"> = {
      userId: "user1", // Replace with actual user ID
      bookId: 1, // Replace with actual book ID
      note: newNote,
      pageNumber: pageNumber,
      series: "Series A", // Replace with actual series or make it dynamic
    };

    const addedNote = await addNote(noteToAdd);
    setNotes([addedNote, ...notes]);
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
                <p>Updated: {note.updatedDate.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
