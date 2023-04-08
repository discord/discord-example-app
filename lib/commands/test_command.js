import { InteractionResponseType } from 'discord-interactions';
import { getRandomEmoji } from '../utils.js';

export function testCommand(res) {
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      // Fetches a random emoji to send from a helper function
      content: 'hello world ' + getRandomEmoji(),
    },
  });
}
