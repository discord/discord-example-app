import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
  verifyKeyMiddleware
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';
import { getResult, getRPSChoices } from './game.js';

const app = express();
const PORT = process.env.PORT || 3000;
const activeGames = {};

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }

    if (name === 'challenge') {
      const userId = req.body.member?.user?.id || req.body.user?.id;
      const objectName = data.options[0].value;
      const gameId = req.body.id;

      activeGames[gameId] = {
        id: userId,
        objectName,
        challenger: true  // Mark this as the challenger's move
      };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Rock papers scissors challenge from <@${userId}>`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: `accept_button_${gameId}`,
                  label: 'Accept',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const componentId = data.custom_id;
    
    if (componentId.startsWith('accept_button_')) {
      const gameId = componentId.replace('accept_button_', '');
      const game = activeGames[gameId];
      
      if (!game) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'This game is no longer valid.',
            flags: 64,
          },
        });
      }

      const userId = req.body.member?.user?.id || req.body.user?.id;

      // For self-play, use the same move
      const result = getResult(
        { id: game.id, objectName: game.objectName },
        { id: userId, objectName: game.objectName }
      );

      delete activeGames[gameId];

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: result,
          components: [],  // Remove the button after the game is complete
        },
      });
    }
  }

  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'An error occurred while processing the command.',
      flags: 64,
    },
  });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});