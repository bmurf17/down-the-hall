import { getData } from '@/actions/bookActions';
import Track from '@/components/track/Track';
import { Book } from '@/types/book';

export default async function Home() {
  const books: Book[] = await getData();
  return (
    <div className='mx-16'>
      <Track books={books}/>
    </div>
  );
}
