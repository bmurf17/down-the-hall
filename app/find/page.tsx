import { getGoogleBooks } from '@/actions/googleBookActions';
import { getBooks } from '@/actions/hardcoverActions'
import Find from '@/components/find/Find';
import { GoogleBooksResponse } from '@/types/googlebookresponse';
import { HardCoverApiResponse } from '@/types/hardcoverresponse';

interface Props {
  searchParams?: { title?: string }
}

export default async function FindPage({ searchParams }: Props) {
  const searchTitle = searchParams?.title || ''

  const hardcoverBooks: HardCoverApiResponse = await getBooks(searchTitle);
    return (
    <div className='mx-16'>
      <Find books={hardcoverBooks} />
    </div>
  );
}
