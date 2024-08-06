import { getGoogleBookByIsbn } from '@/actions/googleBookActions';
import { getBook } from '@/actions/hardcoverActions';
import BookDetails from '@/components/bookDetails/BookDetails';
import { GoogleBooksResponse } from '@/types/googlebookresponse';
import { HardCoverApiResponse } from '@/types/hardcoverresponse';

export default async function Page({ params }: { params: { bookId: string } }) {
    const data: GoogleBooksResponse = await getGoogleBookByIsbn(params.bookId)
    const data2: HardCoverApiResponse = await getBook(params.bookId);
    return (
    <div className=''>
        <BookDetails bookInfo={data2.data.books[0]}/>        
    </div>);
}
