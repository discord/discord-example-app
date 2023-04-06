import GoodReadsParser from 'goodreads-parser';

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