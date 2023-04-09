import { InteractionResponseType } from 'discord-interactions';
import { Request, Response } from 'express';
import { searchBooks } from '../goodreads/goodreads_search.js';
import { BookClubState } from '../types/BookClubState.js';
import { ICommand } from './CommandFactory.js';

export default class BookSearchCommand implements ICommand {
    async execute(req: Request, res: Response, state: BookClubState): Promise<Response> {
        const { data } = req.body;
        try {
            const searchQuery = data.options[0].value;
            const books = await searchBooks(searchQuery);
            const summary = books.map((book, i) => {
                return `${i + 1}) ${book.title} by ${book.author} can be found at: ${book.url}`;
            });

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `You searched for "${searchQuery}". The top results I got:\n`
                        + (summary.length > 0 ? summary.join('\n') : 'No results!'),
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
}

