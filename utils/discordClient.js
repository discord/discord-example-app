import { Client, GatewayIntentBits } from 'discord.js';

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Login and handle connection
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Login with your bot token
client.login(process.env.DISCORD_BOT_TOKEN);

export default client; 