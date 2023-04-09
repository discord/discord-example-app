import config from "../config.js";
import { InteractionResponseType } from 'discord-interactions';
import { Request, Response } from 'express';
import { DiscordRequest } from '../utils.js';
import { getBookData } from '../goodreads/goodreads_search.js';
import { BookClubState } from '../types/book_club_state.js';

export async function shortlistCommand(req: Request, res: Response, bookClubState: BookClubState) {
    const { data } = req.body;
    const subCommand = data.options[0].name;
    if (subCommand === 'list') {
        const books = bookClubState.shortlist.books.map((book, i) => {
            return `${i + 1}) ${book.title} by ${book.author} (${book.url}).`;
        });

        const booksList = books.length > 0
            ? books.join('\n')
            : 'No books in the shortlist yet! Add some with "/shortlist add <Goodreads url>"';

        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'This is the current shortlist:\n' + booksList,
            }
        });
    } else if (subCommand === 'add') {
        const url = data.options[0].options[0].value;

        await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Request to add the book to the shortlist received! Let me find some more data..'
            }
        })

        const book = await getBookData(url);

        if (book !== null) {
            bookClubState.shortlist.books.push({
                id: book.id,
                title: book.title,
                author: book.author,
                url: book.url,
            });

            const resultStr = 'The following book was added to the shortlist:\n' +
                `${book.title} by ${book.author} (${book.url}).`

            const endpoint = `webhooks/${config.APP_ID}/${req.body.token}/messages/@original`;

            try {
                // Update ephemeral message
                await DiscordRequest(endpoint, {
                    method: 'PATCH',
                    body: {
                        content: resultStr,
                        components: [],
                    },
                });
            } catch (err) {
                console.error('Error sending message:', err);
            }
        } else {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'Mehhh.. I couldn\'t find the book.',
                }
            });
        }
    } else if (subCommand === 'remove') {
        const removeIndex = data.options[0].options[0].value - 1;
        if (removeIndex >= 0 && removeIndex < bookClubState.shortlist.books.length) {
            const [book] = bookClubState.shortlist.books.splice(removeIndex, 1);
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'Removed this book from the shortlist:\n' +
                        `${book.title} by ${book.author} (${book.url}).`
                }
            });
        } else {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'Uh, we don\'t have a book with that number on our shortlist!',
                }
            });
        }
    }
}