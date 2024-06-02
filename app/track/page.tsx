import { getData } from '@/actions/bookActions';
import Track from '@/components/track/Track';
import { SelectBook } from '@/lib/schema';

export default async function Home() {
  const books: SelectBook[] = await getData();
  return (
    <div className='mx-16'>
      <Track books={books}/>
    </div>
  );
}
