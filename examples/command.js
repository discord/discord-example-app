import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from '../utils.js';

// Create and configure express app
const app = express();
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;
  /**
   * Handle slash command requests
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    // Slash command with name of "test"
    if (data.name === 'test') {
      // Send a message as response
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'A wild message appeared' },
      });
    }
  }
});

async function createCommand() {
  const appId = process.env.APP_ID;
  const guildId = process.env.GUILD_ID;

  /**
   * Globally-scoped slash commands (generally only recommended for production)
   * See https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
   */
  // const globalEndpoint = `applications/${appId}/commands`;

  /**
   * Guild-scoped slash commands
   * See https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
   */
  const guildEndpoint = `applications/${appId}/guilds/${guildId}/commands`;
  const commandBody = {
    name: 'test',
    description: 'Just your average command',
    // chat command (see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types)
    type: 1,
  };

  try {
    // Send HTTP request with bot token
    const res = await DiscordRequest(guildEndpoint, {
      method: 'POST',
      body: commandBody,
    });
    console.log(await res.json());
  } catch (err) {
    console.error('Error installing commands: ', err);
  }
}

app.listen(3000, () => {
  console.log('Listening on port 3000');

  createCommand();
});
