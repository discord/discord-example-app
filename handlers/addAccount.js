import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import crypto from 'crypto';
import { MessageTemplates } from '../utils/messageTemplates.js';

export default async function handleAddAccount(req, res, member, options) {
  const platform = options.find(opt => opt.name === 'platform').value;
  const username = options.find(opt => opt.name === 'username').value;
  
  try {
    const user = await db.User.findOne({
      where: { discordId: member.user.id }
    });

    if (!user) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Please register first using `/register`',
          flags: 64
        }
      });
    }

    const existingAccount = await db.SocialMediaAccount.findOne({
      where: {
        platform,
        username
      }
    });

    if (existingAccount) {
      if (existingAccount.userId === user.id) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: MessageTemplates.accountAlreadyRegistered(platform, username)
        });
      } else {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: MessageTemplates.accountAlreadyClaimed(platform, username)
        });
      }
    }

    const verificationCode = crypto.randomBytes(4).toString('hex');
    
    const account = await db.SocialMediaAccount.create({
      userId: user.id,
      platform,
      username,
      verificationCode,
      isVerified: false
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Please add this code to your ${platform} bio: ${verificationCode}\n` +
                'Once added, use `/verify-status` to verify your account.',
        flags: 64
      }
    });
  } catch (error) {
    console.error('Add account error:', error);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error adding your account. Please try again.',
        flags: 64
      }
    });
  }
} 