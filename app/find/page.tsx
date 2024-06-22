import { getData } from '@/actions/bookActions';
import Find from '@/components/find/Find';
import { Book } from '@/types/book';

export default async function FindPage() {
  const books: Book[] = await getData();
  return (
    <div className='mx-16'>
      <Find/>
    </div>
  );
}
