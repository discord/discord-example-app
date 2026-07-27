import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';

import { closeDatabase } from './database.js';
import { sendWelcomeMessage } from './welcome.js';

let client;

export async function startGateway() {
  if (!process.env.DISCORD_TOKEN) {
    console.warn('Gateway disabled: DISCORD_TOKEN is not configured');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.warn('Gateway disabled: DATABASE_URL is not configured');
    return;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord gateway ready as ${readyClient.user.tag}`);
  });

  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      await sendWelcomeMessage(member);
    } catch (error) {
      console.error(
        `Could not send welcome message for guild ${member.guild.id}:`,
        error,
      );
    }
  });

  client.on(Events.Error, (error) => {
    console.error('Discord gateway error:', error);
  });

  await client.login(process.env.DISCORD_TOKEN);
}

export async function stopGateway() {
  client?.destroy();
  client = undefined;
  await closeDatabase();
}
