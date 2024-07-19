
import { asc, eq } from "drizzle-orm";
import db from "../../../lib/db";
import { author, book } from "../../../lib/schema";
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    const status = request.nextUrl.searchParams.get("status")

    if (status && status?.length > 0 && !Number.isNaN(+status)) {
        const data = await db.select().from(book).fullJoin(author, eq(book.authorId, author.id)).where(eq(book.status, +status)).orderBy(asc(book.id));
        return NextResponse.json(data)
    }
    const data = await db.select().from(book).innerJoin(author, eq(book.authorId, author.id));
    return NextResponse.json(data)
};