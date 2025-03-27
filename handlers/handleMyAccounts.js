import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';

export async function handleMyAccounts(req, res, member) {
  try {
    const discordId = member.user.id;
    
    // Find user and include their social media accounts
    const user = await db.User.findOne({
      where: { discordId }
    });

    const socialMediaAccounts = await db.SocialMediaAccount.findAll({
      where: { userId: user.id }
    });

    if (!user) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "You haven't registered yet. Please use `/register` to get started!",
          flags: 64
        }
      });
    }

    // Group accounts by platform
    const accounts = socialMediaAccounts || [];
    if (accounts.length === 0) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "You don't have any social media accounts linked yet. Use `/add-account` in the '#command-center' channel to link one!",
          flags: 64
        }
      });
    }

    // Format accounts by platform
    const platformEmojis = {
      'INSTAGRAM': '📸',
      'TIKTOK': '🎵',
      'YOUTUBE': '🎥',
      'X': '🐦'
    };

    const accountsList = accounts.map(account => {
      const emoji = platformEmojis[account.platform] || '📱';
      const verificationStatus = account.isVerified ? '✅ Verified' : '❌ Not verified';
      return `${emoji} **${account.platform}**\n• Username: \`${account.username}\`\n• Status: ${verificationStatus}`;
    }).join('\n\n');

    const response = {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [{
          title: '🔗 Your Linked Social Media Accounts',
          description: accountsList,
          color: 0x3498db,
          footer: {
            text: 'Use /add-account in the #command-center channel to link more accounts'
          }
        }],
        flags: 64
      }
    };

    return res.send(response);
  } catch (error) {
    console.error('Error in handleMyAccounts:', error);
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error fetching your accounts. Please try again later.',
        flags: 64
      }
    });
  }
}

export default handleMyAccounts;