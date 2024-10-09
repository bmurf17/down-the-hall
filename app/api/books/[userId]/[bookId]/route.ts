import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg"; // Assuming you're using PostgreSQL

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; bookId: string } }
): Promise<NextResponse> {
  const { userId, bookId } = params;

  if (!userId || !bookId) {
    return NextResponse.json(
      { error: "User ID and Book ID are required" },
      { status: 400 }
    );
  }

  try {
    const query = `
     WITH book_data AS (
        SELECT *
        FROM book
        WHERE hardcover_id = $1 AND user_id = $2
      )
      SELECT 
        b.*,
        a.id AS author_id,
        a.name AS author_name,
        json_agg(
          json_build_object(
            'id', bn.id,
            'page_number', bn.page_number,
            'series', bn.series,  
            'note', bn.note
          )
        ) AS book_notes
      FROM book_data b
      LEFT JOIN author a ON b.author_id = a.id
      LEFT JOIN book_note bn ON b.id = bn.book_id AND bn.user_id = $2
      GROUP BY b.id, a.id,  b.title, b.author_id,  b.image, b.status, b.release_year, b.default_physical_edition_id, b.description, b.series_position, b.series_name, b.series_length, b.hardcover_id, b.page_count, b.genres, b.date_read, b.date_updated, b.user_id; 
    `;

    const result = await pool.query(query, [parseInt(bookId), userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const data = result.rows[0];

    console.log(data);
    const response = {
      book: {
        id: data.id,
        title: data.title,
        hardcover_id: data.hardcover_id,
        // Include other book fields as needed
      },
      author: {
        id: data.author_id,
        name: data.author_name,
        // Include other author fields as needed
      },
      book_notes: data.book_notes || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
