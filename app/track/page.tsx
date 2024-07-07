import { getData } from '@/actions/bookActions';
import Track from '@/components/track/Track';
import { Book } from '@/types/book';

interface Props {
  searchParams?: { status?: string }
}

export default async function TrackPage({ searchParams }: Props) {
  const books: Book[] = await getData(searchParams?.status);
  return (
    <div className='mx-16'>
      <Track books={books}/>
    </div>
  );
}
