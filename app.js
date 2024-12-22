import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

// Active games storage
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data, id, member, user, token, message } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    // "test" command
    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }

    // "challenge" command
    if (name === 'challenge' && id) {
      const userId = member?.user?.id || user?.id; // Handle DM vs server cases
      const objectName = options?.[0]?.value; // Get the user's choice from options

      if (!objectName) {
        return res.status(400).json({ error: 'Invalid or missing options in request' });
      }

      // Create active game using interaction ID as the game ID
      activeGames[id] = { userId, objectName };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Rock paper scissors challenge from <@${userId}>`,
          components: [
            {
              type: 1, // ACTION_ROW
              components: [
                {
                  type: 2, // BUTTON
                  custom_id: `accept_button_${id}`,
                  label: 'Accept',
                  style: 1, // PRIMARY
                },
              ],
            },
          ],
        },
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const componentId = data.custom_id;

    if (componentId.startsWith('accept_button_')) {
      const gameId = componentId.replace('accept_button_', '');

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'What is your object of choice?',
          flags: 64, // EPHEMERAL
          components: [
            {
              type: 1, // ACTION_ROW
              components: [
                {
                  type: 3, // STRING_SELECT
                  custom_id: `select_choice_${gameId}`,
                  options: getShuffledOptions(),
                },
              ],
            },
          ],
        },
      });
    } else if (componentId.startsWith('select_choice_')) {
      const gameId = componentId.replace('select_choice_', '');

      if (activeGames[gameId]) {
        const userId = member?.user?.id || user?.id; // Handle DM vs server cases
        const resultStr = getResult(activeGames[gameId], {
          userId,
          objectName: data.values[0], // Selected value
        });

        delete activeGames[gameId];

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: resultStr },
        });
      }
    }
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
