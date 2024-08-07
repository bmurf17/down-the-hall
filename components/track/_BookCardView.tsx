import { Book } from '@/types/book';

interface Props {
  book: Book;
}

export default function BookCardView({ book }: Props) {
  const bookObject = book.book;
  const author = book.author;

  return (
    <div className='flex gap-4 justify-between'>
      <div className='flex gap-4'>
      <img
        className='relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block'
        src={bookObject?.image || ''}
        alt={bookObject?.title}
        height={100}
        width={100}
      />

      <div className='flex flex-col gap-2 justify-center'>
          <div>{bookObject?.title}</div>
          <div>{author?.name}</div>
        </div>
      </div>
      
        
        <div className='flex align-bottom self-center'>
          <div>Button</div>
        </div>
    </div>
  );
}
