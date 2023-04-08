import GoodReadsParser from 'goodreads-parser';
import { scrapeBookFromUrl } from './goodreads_scraper.js';

export async function searchBooks(query) {
    try {
        const searchResults = await GoodReadsParser.searchBooks({ q: query, page: 0 });
        console.log('Search query', query);
        console.log('Results', searchResults);
        return searchResults;
    } catch (error) {
        console.error("error", error);
        return {
            books: [],
        };
    }
}

export async function getBookData(goodreads_url) {
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