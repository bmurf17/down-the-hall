export interface GoogleBooksResponse {
    items: BookItem[];
}

export interface BookItem {
    volumeInfo: VolumeInfo;
}

export interface VolumeInfo {
    title: string;
    authors: string[];
    description: string;
    pageCount: number;
    categories: string[];
    imageLinks: ImageLinks;
    industryIdentifiers: IndustryIdentifier[]
}

export interface ImageLinks {
    thumbnail: string;
}

export interface IndustryIdentifier {
    type: string;
    identifier: string;
}