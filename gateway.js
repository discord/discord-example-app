import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';

import {
  closeDatabase,
  recordGuildRuntimeStatus,
} from './database.js';
import { sendExitMessage } from './exit.js';
import { enforceMediaOnlyMessage } from './media-only.js';
import { sendWelcomeMessage } from './welcome.js';

const HEARTBEAT_INTERVAL_MS = 30_000;
const processStartedAt = new Date();

let client;
let heartbeatTimer;

function getConnectedGuildIds() {
  return client ? [...client.guilds.cache.keys()] : [];
}

async function writeRuntimeStatus(guildIds, connected) {
  try {
    await recordGuildRuntimeStatus(guildIds, {
      connected,
      startedAt: processStartedAt,
    });
  } catch (error) {
    console.error('Could not update bot runtime status:', error);
  }
}

function startHeartbeat() {
  clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    if (client?.isReady()) {
      void writeRuntimeStatus(getConnectedGuildIds(), true);
    }
  }, HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref();
}

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
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord gateway ready as ${readyClient.user.tag}`);
    void writeRuntimeStatus(getConnectedGuildIds(), true);
    startHeartbeat();
  });

  client.on(Events.GuildCreate, (guild) => {
    void writeRuntimeStatus([guild.id], true);
  });

  client.on(Events.GuildDelete, (guild) => {
    void writeRuntimeStatus([guild.id], false);
  });

  client.on(Events.ShardDisconnect, () => {
    void writeRuntimeStatus(getConnectedGuildIds(), false);
  });

  client.on(Events.ShardReady, () => {
    void writeRuntimeStatus(getConnectedGuildIds(), true);
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

  client.on(Events.GuildMemberRemove, async (member) => {
    try {
      await sendExitMessage(member);
    } catch (error) {
      console.error(
        `Could not send exit message for guild ${member.guild.id}:`,
        error,
      );
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    try {
      await enforceMediaOnlyMessage(message);
    } catch (error) {
      console.error(
        `Could not enforce media-only channel ${message.channelId}:`,
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
  clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
  await writeRuntimeStatus(getConnectedGuildIds(), false);
  client?.destroy();
  client = undefined;
  await closeDatabase();
}
