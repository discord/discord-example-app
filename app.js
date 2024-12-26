import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
  InteractionResponseFlags,
  verifyKeyMiddleware
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getResult, getRPSChoices, getShuffledOptions } from './game.js';

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
        challengerId: userId,
        challengerChoice: objectName,
        timestamp: Date.now()
      };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `<@${userId}> challenges you to Rock Paper Scissors! ${getRandomEmoji()}`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: `accept_button_${gameId}`,
                  label: 'Accept Challenge',
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
            content: 'This challenge is no longer valid.',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      const userId = req.body.member?.user?.id || req.body.user?.id;
      
      if (userId === game.challengerId) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'You cannot accept your own challenge!',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      try {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Choose your object! 🎮',
            flags: InteractionResponseFlags.EPHEMERAL,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.STRING_SELECT,
                    custom_id: `select_choice_${gameId}`,
                    options: getShuffledOptions(),
                  },
                ],
              },
            ],
          },
        });

        const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
        await DiscordRequest(endpoint, { method: 'DELETE' });
      } catch (err) {
        console.error('Error handling button interaction:', err);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'An error occurred while processing the challenge.',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
    } else if (componentId.startsWith('select_choice_')) {
      const gameId = componentId.replace('select_choice_', '');
      const game = activeGames[gameId];

      if (!game) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'This game is no longer valid.',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      const userId = req.body.member?.user?.id || req.body.user?.id;
      const objectName = data.values[0];

      try {
        const result = getResult(
          { id: game.challengerId, objectName: game.challengerChoice },
          { id: userId, objectName: objectName }
        );

        delete activeGames[gameId];

        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${result} ${getRandomEmoji()}`,
          },
        });

        const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
        await DiscordRequest(endpoint, {
          method: 'PATCH',
          body: {
            content: `You chose ${objectName}! ${getRandomEmoji()}`,
            components: [],
          },
        });
      } catch (err) {
        console.error('Error handling select menu interaction:', err);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'An error occurred while processing your choice.',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});