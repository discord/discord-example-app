import config from '../config.js';
import { InteractionResponseType } from 'discord-interactions';
import { Request, Response } from 'express';
import { DiscordRequest } from '../utils.js';
import { getBookData } from '../goodreads/goodreads_search.js';
import { BookClubState } from '../types/BookClubState.js';
import { ICommand } from './CommandFactory.js';

export default class BookEventCommand implements ICommand {
    async execute(
        req: Request,
        res: Response,
        state: BookClubState,
    ): Promise<Response> {
        const { data } = req.body;
        const subCommand = data.options[0].name;
        if (subCommand === 'list') {
            const events = state.events.map((event, i) => {
                const { book, date } = event;
                return (
                    `#${
                        i + 1
                    } On ${date.toLocaleString()}, this book is scheduled:\n` +
                    `${book.title} by ${book.author} (${book.url}).\n`
                );
            });

            const eventsList =
                events.length > 0
                    ? events.join('\n')
                    : 'There are no events scheduled! Add some with "/bookevent add <Date> <Goodreads url>"';

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content:
                        'These are the scheduled book club events:\n' +
                        eventsList,
                },
            });
        } else if (subCommand === 'add') {
            const dateStr = data.options[0].options[0].value;
            const date = new Date(dateStr);
            const url = data.options[0].options[1].value;

            const initialSend = await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content:
                        'Request to add a new event received! Let me find some more data on the book..',
                },
            });

            const book = await getBookData(url);

            if (book !== null) {
                state.events.push({
                    date,
                    book,
                });

                const resultStr =
                    'The following event was added to the events list:\n' +
                    `On ${date.toLocaleString()}, we will discuss ${
                        book.title
                    } by ${book.author} (${
                        book.url
                    }). Get your Libby reservation now!`;

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
                    return initialSend;
                } catch (err) {
                    console.error('Error sending message:', err);
                    return initialSend;
                }
            } else {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content:
                            "Mehhh.. I couldn't find the book you were trying to add.",
                    },
                });
            }
        } else if (subCommand === 'remove') {
            const removeIndex = data.options[0].options[0].value - 1;
            if (removeIndex >= 0 && removeIndex < state.events.length) {
                const [event] = state.events.splice(removeIndex, 1);
                const { book, date } = event;
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content:
                            'Removed this event from your scheduled events:\n' +
                            `${book.title} by ${
                                book.author
                            } which was scheduled for ${date.toLocaleString()}.`,
                    },
                });
            } else {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content:
                            "Uh, we don't have an event with that number in our scheduled events!",
                    },
                });
            }
        }

        throw new Error('Missing subcommand implementation');
    }
}
