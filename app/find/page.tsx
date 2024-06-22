import { getGoogleBooks } from '@/actions/googleBookActions';
import Find from '@/components/find/Find';
import { GoogleBooksResponse } from '@/types/googlebookresponse';

export default async function FindPage() {
  const googleBooks: GoogleBooksResponse = await getGoogleBooks('dune');
  return (
    <div className='mx-16'>
      <Find books={googleBooks}/>
    </div>
  );
}
