import { InteractionResponseType } from 'discord-interactions';
import { searchBooks } from '../goodreads/goodreads_search.js';

export async function bookSearchCommand(res, data) {
    try {
        const searchQuery = data.options[0].value;
        const searchResults = await searchBooks(searchQuery);
        const books = [];
        if (searchResults.books) {
            books.push(...searchResults.books.slice(0, 3).map((book, i) => {
                return `${i + 1}) ${book.title} by ${book.author} can be found at: ${book.url}`;
            }));
        }

        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `You searched for "${searchQuery}". The top results I got:\n`
                    + (books.length > 0 ? books.join('\n') : 'No results!'),
            }
        });
    } catch (error) {
        console.error('error', error);
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Ugh, my creator failed and some error happened...',
            }
        });
    }
}