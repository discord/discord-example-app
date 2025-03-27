import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import { MessageTemplates } from '../utils/messageTemplates.js';
import addRole from '../utils/roleManager.js';

export async function handleRegister(req, res, guild, member) {
  try {
    const guildId = guild['id'];

    const [user, created] = await db.User.findOrCreate({
      where: { discordId: member.user.id },
      defaults: {
        isVerified: false
      }
    });

    if (!created && user) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: MessageTemplates.alreadyRegistered(),
      });
    }

    if (created) {
      await addRole(member.user.id, guildId, process.env.MEMBER_ROLE_NAME);
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [{
          title: "Welcome to ClipMore",
          description: "We're so glad you've chosen one of our programs to contribute to!\n\n" +
            "Our records indicate that you don't yet have any accounts linked, so let's fix that.\n\n" +
            "Once you have an account on any of our supported platforms (TikTok, Instagram, " +
            "YouTube, or X / Twitter), use `/add-account` in the '#command-center' channel to begin the verification process.",
          color: 0x5865F2,
        }],
        flags:  64 
      }
    });
  } catch (error) {
    console.error('Error in handleRegister:', error);
    return res.status(500).send({ error: 'Failed to handle registration' });
  }
} 

export default handleRegister;