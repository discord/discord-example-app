import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import { validateClipUrl, extractClipMetadata } from '../utils/clipValidation.js';
import { MessageTemplates } from '../utils/messageTemplates.js';
import client from '../utils/discordClient.js';

export default async function handleUpload(req, res, member, options) {
  const urlsString = options.find(opt => opt.name === 'urls').value;
  const urls = urlsString.split(',').map(url => url.trim()).slice(0, 10);

  // Send immediate response that we're processing
  res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: MessageTemplates.uploadProcessing(urls.length)
  });

  try {
    const user = await db.User.findOne({
      where: { discordId: member.user.id },
    });

    const socialMediaAccounts = await db.SocialMediaAccount.findAll({
      where: { userId: user.id, isVerified: true }
    });

    if (!user || !socialMediaAccounts.length) {
      sendDM(member.user.id, MessageTemplates.noVerifiedAccounts());
      return;
    }

    const results = [];
    const errors = [];

    for (const url of urls) {
      try {
        const { platform, username } = await validateClipUrl(url);
        const account = socialMediaAccounts.find(acc => 
          acc.platform === platform && acc.username === username
        );

        console.log(account);

        if (!account) {
          errors.push(`Clip doesn't belong to any of your verified accounts: ${url}`);
          continue;
        }

        const metadata = await extractClipMetadata(url);

        console.log(metadata);
        
        const [clip, created] = await db.Clip.findOrCreate({
          where: {
            url,
            socialMediaAccountId: account.id
          },
          defaults: {
            platform,
            views: metadata.views,
            likes: metadata.likes
          }
        });

        if (created) {
          results.push({
            platform: platform.toString().padEnd(8),
            url: url.length > 50 ? url.substring(0, 47) + '...' : url
          });
        } else {
          errors.push(`Clip has already been uploaded: ${url}`);
        }
      } catch (error) {
        errors.push(`Error processing ${url}: ${error.message}`);
      }
    }

    // Send results via DM
    await sendDM(member.user.id, MessageTemplates.uploadResults(results, errors));

  } catch (error) {
    console.error('Upload error:', error);
    await sendDM(member.user.id, MessageTemplates.uploadError());
  }
}

async function sendDM(userId, messageData) {
  try {
    if (!client.isReady()) {
      throw new Error('Discord client is not ready');
    }

    const user = await client.users.fetch(userId);
    await user.send(messageData);
    console.log(`Sent upload results DM to ${user.tag}`);
  } catch (error) {
    console.error('Failed to send DM:', error);
  }
} 