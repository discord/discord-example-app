import { InteractionResponseType } from 'discord-interactions';
import { getRandomEmoji } from '../utils.js';

/**
 * Representes the `/test` command
 */
export const test = {
  name: 'test',
  description: 'Basic command',
  type: 1, // Chat Input
  integration_types: [0, 1],
  execute,
};

/**
 * Code that is run as a result of running `/test`
 * @returns The JSON returned to the Discord API
 */
async function execute() {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      // Fetches a random emoji to send from a helper function
      content: `hello world ${getRandomEmoji()}`,
    },
  }
}
