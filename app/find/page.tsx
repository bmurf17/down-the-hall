import { getGoogleBooks } from '@/actions/googleBookActions';
import { getBookDetails } from '@/actions/hardcoverActions'
import Find from '@/components/find/Find';
import { GoogleBooksResponse } from '@/types/googlebookresponse';
import { HardCoverApiResponse } from '@/types/hardcoverresponse';

interface Props {
  searchParams?: { title?: string }
}

export default async function FindPage({ searchParams }: Props) {
  const searchTitle = searchParams?.title || 'dune'

  const hardcoverBooks: HardCoverApiResponse = await getBookDetails(searchTitle);
    return (
    <div className='mx-16'>
      <Find books={hardcoverBooks} />
    </div>
  );
}
