import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import crypto from 'crypto';

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
          content: 'Please register first using `/register`'
        }
      });
    }

    const verificationCode = crypto.randomBytes(4).toString('hex');
    
    const [account, created] = await db.SocialMediaAccount.findOrCreate({
      where: {
        userId: user.id,
        platform,
        username
      },
      defaults: {
        verificationCode,
        isVerified: false
      }
    });

    if (!created) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'This account is already registered. Use `/verify-status` to check verification.'
        }
      });
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Please add this code to your ${platform} bio: ${verificationCode}\n` +
                'Once added, use `/verify-status` to verify your account.'
      }
    });
  } catch (error) {
    console.error('Add account error:', error);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error adding your account. Please try again.'
      }
    });
  }
} 