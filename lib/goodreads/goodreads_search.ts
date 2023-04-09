import { searchBooks as queryGoodreads } from 'goodreads-parser';
import { Book } from '../types/book.js';
import { scrapeBookFromUrl } from './goodreads_scraper.js';

export async function searchBooks(query: string, n: number = 3): Promise<Book[]> {
    try {
        const searchResults = await queryGoodreads({ q: query, page: 0 });
        console.log('Search query', query);
        console.log('Results', searchResults);
        
        return searchResults.books.slice(0, n).map((book) => {
            return {
                id: book.id,
                title: book.title,
                author: book.author,
                url: book.url,
            };
        });
    } catch (error) {
        console.error("error", error);
        return [];
    }
}

export async function getBookData(goodreads_url: string): Promise<Book> {
    try {
        // const bookData = await GoodReadsParser.getBook({ url: goodreads_url });
        const bookData = await scrapeBookFromUrl(goodreads_url);
        console.log('URL provided', goodreads_url);
        console.log('Book data', bookData);
        return bookData;
    } catch (error) {
        console.error("error", error);
        return null;
    }
}