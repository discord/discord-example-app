import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import { formatNumber } from '../utils/formatting.js';

export default async function handleStats(req, res, member) {
  try {
    const user = await db.User.findOne({
      where: { discordId: member.user.id },
      include: [{
        model: db.SocialMediaAccount,
        include: [{
          model: db.Clip,
          attributes: ['platform', 'views', 'likes']
        }]
      }]
    });

    if (!user || !user.SocialMediaAccounts.length) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No stats available. Please register and upload some clips first!'
        }
      });
    }

    const stats = user.SocialMediaAccounts.map(account => {
      const totalViews = account.Clips.reduce((sum, clip) => sum + clip.views, 0);
      const totalLikes = account.Clips.reduce((sum, clip) => sum + clip.likes, 0);
      
      return {
        platform: account.platform,
        username: account.username,
        clipCount: account.Clips.length,
        totalViews,
        totalLikes
      };
    });

    const totalStats = stats.reduce((acc, stat) => ({
      clipCount: acc.clipCount + stat.clipCount,
      totalViews: acc.totalViews + stat.totalViews,
      totalLikes: acc.totalLikes + stat.totalLikes
    }), { clipCount: 0, totalViews: 0, totalLikes: 0 });

    const response = [
      '📊 **Your Stats**\n',
      ...stats.map(stat => 
        `**${stat.platform}** (@${stat.username}):\n` +
        `• Clips: ${stat.clipCount}\n` +
        `• Views: ${formatNumber(stat.totalViews)}\n` +
        `• Likes: ${formatNumber(stat.totalLikes)}\n`
      ),
      '\n**Overall Stats**:\n',
      `• Total Clips: ${totalStats.clipCount}`,
      `• Total Views: ${formatNumber(totalStats.totalViews)}`,
      `• Total Likes: ${formatNumber(totalStats.totalLikes)}`,
      `• Estimated Earnings: $${((totalStats.totalViews / 1000) * process.env.RATE_PER_1000_VIEWS).toFixed(2)}`
    ].join('\n');

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: response
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error fetching your stats. Please try again.'
      }
    });
  }
} 