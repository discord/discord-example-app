import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import { validateClipUrl, extractClipMetadata } from '../utils/clipValidation.js';

export default async function handleUpload(req, res, member, options) {
  const urlsString = options.find(opt => opt.name === 'urls').value;
  const urls = urlsString.split(',').map(url => url.trim()).slice(0, 10);

  try {
    const user = await db.User.findOne({
      where: { discordId: member.user.id },
      include: [{
        model: db.SocialMediaAccount,
        where: { isVerified: true }
      }]
    });

    if (!user || !user.SocialMediaAccounts.length) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'You need at least one verified social media account to upload clips.'
        }
      });
    }

    const results = [];
    const errors = [];

    for (const url of urls) {
      try {
        const { platform, username } = validateClipUrl(url);
        const account = user.SocialMediaAccounts.find(acc => 
          acc.platform === platform && acc.username === username
        );

        if (!account) {
          errors.push(`❌ Clip ${url} doesn't belong to any of your verified accounts`);
          continue;
        }

        const metadata = await extractClipMetadata(url);
        
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
          results.push(`✅ Successfully added clip: ${url}`);
        } else {
          errors.push(`❌ Clip already exists: ${url}`);
        }
      } catch (error) {
        errors.push(`❌ Error processing ${url}: ${error.message}`);
      }
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: [
          ...results,
          ...errors
        ].join('\n')
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error processing your upload. Please try again.'
      }
    });
  }
} 