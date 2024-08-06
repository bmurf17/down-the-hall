import Track from '@/components/track/Track';
import { Book } from '@/types/book';

interface Props {
  searchParams?: { status?: string }
}

async function getBookData(status?: string) {
  const res = await fetch(`http://localhost:3000/api/books?status=${status}`, { next: { tags: ['books'] } })
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}

export default async function TrackPage({ searchParams }: Props) {
  const books: Book[] = await getBookData(searchParams?.status);
  return (
    <div className='mx-16'>
      <Track books={books}/>
    </div>
  );
}
