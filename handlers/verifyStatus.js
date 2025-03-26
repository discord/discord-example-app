import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import { verifyPlatformAccount } from '../utils/platformVerification.js';

export default async function handleVerifyStatus(req, res, member, options) {
  const platform = options.find(opt => opt.name === 'platform').value;
  const username = options.find(opt => opt.name === 'username').value;

  try {
    console.log("Discord ID being searched:", member.user.id);
    
    // First try finding just the user without includes
    const basicUser = await db.User.findOne({
      where: { discordId: member.user.id }
    });
    console.log("Basic user search result:", basicUser);

    // Then try finding the social media account separately
    const socialAccount = await db.SocialMediaAccount.findOne({
      where: { platform, username }
    });
    console.log("Social account search result:", socialAccount);

    if (!basicUser || !socialAccount) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Account not found. Please register this account first using `/add-account`.'
        }
      });
    }

    const account = socialAccount
    
    if (account.isVerified) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Your ${platform} account (@${username}) is already verified!`
        }
      });
    }

    // Attempt verification
    const isVerified = await verifyPlatformAccount(platform, username, account.verificationCode);

    
    if (isVerified) {
      await account.update({ isVerified: true });
      await basicUser.update({ isVerified: true });

      // Update Discord role
      // This would need to be implemented using Discord's API
      
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Successfully verified your ${platform} account (@${username})!`
        }
      });
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `❌ Verification code (${account.verificationCode}) not found in your ${platform} bio. Please add it and try again.`
      }
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error checking verification status. Please try again.'
      }
    });
  }
} 