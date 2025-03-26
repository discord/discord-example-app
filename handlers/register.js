import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';

export default async function handleRegister(req, res, member) {
  try {
    const [user, created] = await db.User.findOrCreate({
      where: { discordId: member.user.id },
      defaults: {
        isVerified: false
      }
    });

    if (!created) {
      const hasVerifiedAccounts = await db.SocialMediaAccount.findOne({
        where: {
          userId: user.id,
          isVerified: true
        }
      });

      if (hasVerifiedAccounts) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '✅ You are already registered and verified!'
          }
        });
      }
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Welcome! Please use `/add-account` to link your social media accounts.'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error processing your registration. Please try again.'
      }
    });
  }
} 