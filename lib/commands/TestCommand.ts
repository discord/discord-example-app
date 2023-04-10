import { InteractionResponseType } from 'discord-interactions';
import { Request, Response } from 'express';
import { BookClubState } from '../types/BookClubState.js';
import { getRandomEmoji } from '../utils.js';
import { ICommand } from './CommandFactory.js';

export default class TestCommand implements ICommand {
    async execute(
        req: Request,
        res: Response,
        _state: BookClubState,
    ): Promise<Response> {
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                // Fetches a random emoji to send from a helper function
                content: 'hello world ' + getRandomEmoji(),
            },
        });
    }
}
