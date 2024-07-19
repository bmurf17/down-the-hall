import { getGoogleBookByIsbn } from '@/actions/googleBookActions';
import BookDetails from '@/components/bookDetails/BookDetails';
import { GoogleBooksResponse } from '@/types/googlebookresponse';

export default async function Page({ params }: { params: { bookId: string } }) {
    const data: GoogleBooksResponse = await getGoogleBookByIsbn(params.bookId)
    return (
    <div className='mx-16'>
        <BookDetails bookInfo={data.items[0]}/>        
    </div>);
}
