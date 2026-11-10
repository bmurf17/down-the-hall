"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addBookNote } from "@/functions/addBookNote";
import { useToast } from "@/hooks/use-toast";
import { InsertBookNote } from "@/lib/schema";
import { Book } from "@/types/book";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { EmptyState } from "../shared/EmptyState";
import { BookOpen } from "lucide-react";

interface Props {
  dbBookInfo: Book | null;
}

export default function Notes({ dbBookInfo }: Props) {
  const [newNote, setNewNote] = useState("");
  const [pageNumber, setPageNumber] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (newNote.trim() === "" || isSaving) return;

    const noteToAdd: Omit<InsertBookNote, "id" | "updatedDate" | "userId"> = {
      bookId: dbBookInfo?.book?.id,
      note: newNote,
      pageNumber: pageNumber,
      series: dbBookInfo?.book?.seriesName,
    };

    setIsSaving(true);
    try {
      await addBookNote(noteToAdd, dbBookInfo?.book?.hardcoverId || 0);
      setNewNote("");
      setPageNumber(null);
      router.refresh();
    } catch {
      toast({
        title: "Couldn't save note",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <>
      <>
        <div className="max-w-2xl p-4 sm:p-0">
          <div className="mb-4 space-y-2">
            <Textarea
              className="min-h-28"
              placeholder="Enter your note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Input
              type="number"
              inputMode="numeric"
              className="min-h-11"
              placeholder="Page number (optional)"
              value={pageNumber || ""}
              onChange={(e) =>
                setPageNumber(e.target.value ? parseInt(e.target.value) : null)
              }
            />
            <div className="flex justify-end">
              <Button
                className="min-h-11"
                onClick={handleAddNote}
                disabled={isSaving}
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
            <EmptyState
              icon={BookOpen}
              title="No notes yet"
              description="Add a thought or a page reference above."
            />
          )}
        </div>
      </>
    </>
  );
}
