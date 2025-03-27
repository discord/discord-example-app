import client from '../utils/discordClient.js';
import { InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

export async function handleSetupRegister(req, res, guild) {
  try {
    // First, acknowledge the slash command silently
    await res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Setting up registration channel...",
        flags: 64
      }
    });

    // Ensure client is ready
    if (!client.isReady()) {
      throw new Error('Discord client is not ready');
    }
    

    // Get the guild using the client
    const guildObj = await client.guilds.fetch(guild.id);
    
    // Find or create the registration channel
    const channel = await guildObj.channels.cache.find(c => c.name === 'register') ||
      await guildObj.channels.create({
        name: 'register',
        type: 0, // GUILD_TEXT
        topic: 'Register for Clipping Bot here'
      });

    // Send the welcome message with button
    await channel.send({
      embeds: [{
        title: "Welcome to Clipping Bot",
        description: "Please click the button below to begin the registration process.\n\n" +
          "If you have used our services before, you will have access to all of your accounts " +
          "from across every Clipping exe server after registering.\n\n" +
          "If you haven't, you will be guided through the account registration process.\n\n" +
          "Thank you for clipping!",
        color: 0x5865F2,
        footer: {
          text: "Clipping.bot 2025"
        }
      }],
      components: [{
        type: MessageComponentTypes.ACTION_ROW,
        components: [{
          type: MessageComponentTypes.BUTTON,
          custom_id: "register_button",
          label: "Register",
          style: 1, // PRIMARY
        }]
      }]
    });

  } catch (error) {
    console.error('Error in handleSetupRegister:', error);
  }
}

export default handleSetupRegister;