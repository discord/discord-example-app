import { InteractionResponseType } from 'discord-interactions';
import { Request, Response } from 'express';
import { BookClubState } from '../types/book_club_state.js';
import { getRandomEmoji } from '../utils.js';
import { ICommand } from './command_factory.js';

export class TestCommand implements ICommand {
  async execute(req: Request, res: Response, state: BookClubState): Promise<Response> {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        // Fetches a random emoji to send from a helper function
        content: 'hello world ' + getRandomEmoji(),
      },
    });
  }
}