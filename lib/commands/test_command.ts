import { InteractionResponseType } from 'discord-interactions';
import { Request, Response } from 'express';
import { getRandomEmoji } from '../utils.js';

export function testCommand(_: Request, res: Response): void {
  res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      // Fetches a random emoji to send from a helper function
      content: 'hello world ' + getRandomEmoji(),
    },
  });
}
