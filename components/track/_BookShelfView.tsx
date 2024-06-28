import { Book } from '@/types/book';

interface Props {
  book: Book;
}

export default function BookShelfView({ book }: Props) {
  const bookObject = book.book;
  const author = book.author;

  return (
    <div className='flex'>
      <img
        className='relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block'
        src={bookObject.image || ''}
        alt={bookObject.title}
        height={100}
        width={100}
      />
    </div>
  );
}
