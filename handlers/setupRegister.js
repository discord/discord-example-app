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
        topic: 'Register for ClipMore here'
      });

    // Send the welcome message with button
    await channel.send({
      embeds: [{
        title: "✨ Welcome to ClipMore ✨",
        description: "### Ready to Get Started?\n" +
          "> 🎥 Click the button below to begin your registration journey!\n\n" +
          "**Returning User?**\n" +
          "• All your existing accounts across ClipMore servers will be automatically connected\n\n" +
          "**New to ClipMore?**\n" +
          "• Don't worry! We'll guide you through every step of the process\n\n" +
          "🌟 *Thank you for choosing ClipMore!*",
        color: 0x7289DA, // A softer Discord blue
        thumbnail: {
          url: "https://drive.usercontent.google.com/download?id=1Aq7kl39paKgFaxqiNAjRcRPw7QoQfGSM"
        },
        footer: {
          text: "ClipMore Bot • Making Content Creation Easier"
        },
        timestamp: new Date().toISOString()
      }],
      components: [{
        type: MessageComponentTypes.ACTION_ROW,
        components: [{
          type: MessageComponentTypes.BUTTON,
          custom_id: "register_button",
          label: "🎬 Register Now",
          style: 1,
        }]
      }]
    });

  } catch (error) {
    console.error('Error in handleSetupRegister:', error);
  }
}

export default handleSetupRegister;