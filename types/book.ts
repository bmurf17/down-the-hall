import { SelectAuthor, SelectBook } from '@/lib/schema';

export interface Book{
    book: SelectBook | null;
    author: SelectAuthor | null;
}