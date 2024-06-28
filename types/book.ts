import { SelectAuthor, SelectBook } from '@/lib/schema';

export interface Book {
    book: SelectBook,
    author: SelectAuthor
}