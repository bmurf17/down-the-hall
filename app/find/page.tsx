import { getGoogleBooks } from '@/actions/googleBookActions';
import Find from '@/components/find/Find';
import { GoogleBooksResponse } from '@/types/googlebookresponse';

interface Props {
  searchParams?: { title?: string }
}

export default async function FindPage({ searchParams }: Props) {
  const searchTitle = searchParams?.title || 'dune'
  
  const googleBooks: GoogleBooksResponse = await getGoogleBooks(searchTitle);
  return (
    <div className='mx-16'>
      <Find books={googleBooks}/>
    </div>
  );
}
