import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  verifyKeyMiddleware,
  ButtonStyleTypes,
} from 'discord-interactions';
import { capitalize, getAllOpenShotsFormatted, deletePreviousMessage } from './utils.js';
import { createDatabaseService } from './database.js';
import { getRandomViolationDescription as getRandomViolationDescription, getViolations } from './violations.js';
import usernameCache from './usernameCache.js';
import { databasePath } from './envHelper.js';
import { COMMANDS } from './commands.js';

console.log('Starting server...');

const db = await createDatabaseService(databasePath());

async function listAllShotsChannelMessage(isPublic) {

  const dbShots = await db.getAllOpenShots();

  const shots = await Promise.all(dbShots.map(async function (shot) {
    const playerId = shot.player_id;
    const openShots = shot.open_shots;
    return {
      name: await usernameCache.getUsername(playerId),
      open_shots: openShots,
    };
  }));

  const shotsFormatted = getAllOpenShotsFormatted(shots);

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: !isPublic ? InteractionResponseFlags.EPHEMERAL : 0,
      content: shotsFormatted,
    },
  };
}


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  // console.log('INTERACTION::body', req.body);

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === COMMANDS.REDEEM_SHOT_COMMAND.name) {
      // redeem 1 shot for the user
      const offender = req.body.member.user.id;
      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: `### Confirm drinking a shot`,
          // Selects are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the select menu interactions
                  custom_id: 'accept_redeem_button_offender=' + offender,
                  style: ButtonStyleTypes.PRIMARY,
                  label: 'I chugged one',
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the select menu interactions
                  custom_id: 'cancel_redeem_button_offender=' + offender,
                  style: ButtonStyleTypes.DANGER,
                  label: 'I Lied',
                },
              ]
            }
          ],
        },
      });

      return result;
    }

    if (name === COMMANDS.LIST_OPEN_SHOTS_COMMAND.name) {
      // List all open shots
      return res.send(await listAllShotsChannelMessage(true));
    }

    // shot command
    if (name === COMMANDS.SHOT_COMMAND.name) {

      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          // Selects are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.USER_SELECT,
                  // Value for your app to identify the select menu interactions
                  custom_id: 'offender_select',
                  // Select options - see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
                  placeholder: "Select the offender",
                  min_values: 0,
                  max_values: 1,
                },
              ],
            },
          ],
        },
      });

      return result;
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;

    if (componentId === 'offender_select') {
      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          // Selects are inside of action rows
          components: [
            {
              // violation select menu

              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  // Value for your app to identify the select menu interactions
                  custom_id: 'violation_select_offender=' + data.values[0],
                  // Select options - see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
                  options: getViolations().map((violation) => ({
                    label: capitalize(violation),
                    value: violation,
                  })),
                  placeholder: "Select the violation",
                  min_values: 1,
                  max_values: 1,
                }
              ],
            },
          ],
        },
      });

      await deletePreviousMessage(req.body.token, req.body.message.id);
      return result;
    }

    if (componentId.startsWith('violation_select_')) {
      const offender = componentId.split('=')[1];
      const violation = data.values[0];

      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: `### Confirm the shot\n<@${offender}>: ${capitalize(violation)}`,
          // Selects are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the select menu interactions
                  custom_id: 'accept_shot_button_offender=' + offender + ',violation=' + violation,
                  style: ButtonStyleTypes.PRIMARY,
                  label: 'Confirm',
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the select menu interactions
                  custom_id: 'cancel_shot_button',
                  style: ButtonStyleTypes.SECONDARY,
                  label: 'Cancel',
                },
              ]
            }
          ],
        },
      });

      await deletePreviousMessage(req.body.token, req.body.message.id);
      return result;
    }

    if (componentId.startsWith('accept_shot_button_')) {
      // get the associated game ID
      const offender = componentId.split('=')[1].split(',')[0];
      const violation = componentId.split(',')[1].split('=')[1];

      console.log('offender', offender);
      console.log('violation', violation);

      await db.addShot(offender, violation);

      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `### Violation confirmed.\n<@${offender}> has to take a shot for **${capitalize(violation)}**\n\n> ${getRandomViolationDescription(violation)}.`,
        }
      });

      await deletePreviousMessage(req.body.token, req.body.message.id);
      return result;
    }

    if (componentId === 'cancel_shot_button') {
      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Shot cancelled',
          flags: InteractionResponseFlags.EPHEMERAL,
        }
      });

      await deletePreviousMessage(req.body.token, req.body.message.id);
      return result;
    }

    if (componentId.startsWith('cancel_redeem_button_')) {
      const offender = componentId.split('=')[1];
      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `### You fucking liar. That will cost you another shot!\n@here: Please punish the filthy liar <@${offender}>!`,
        }
      });

      await deletePreviousMessage(req.body.token, req.body.message.id);
      return result;
    }

    if (componentId.startsWith('accept_redeem_button_')) {
      // get the associated game ID
      const offender = componentId.split('=')[1].split(',')[0];
      const { redeemed, violationType } = await db.redeemShot(offender);
      const content = redeemed ? `### Shot redemption confirmed.\n<@${offender}> took a shot for **${capitalize(violationType)}**.` : `### <@${offender}> is an absolute alcoholic. They didn't have to drink but hey, enjoy! Maybe you actually start hitting the ball soon!`

      const result = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: content,
        }
      });

      await deletePreviousMessage(req.body.token, req.body.message.id);
      return result;
    }
  }



  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});