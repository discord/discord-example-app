import { InteractionResponseType } from 'discord-interactions';
import db from '../models/index.js';
import { formatNumber } from '../utils/formatting.js';
import { Op } from 'sequelize';

export default async function handleLeaderboard(req, res) {
  try {
    // Get all users with their total views
    const users = await db.User.findAll({
      include: [{
        model: db.SocialMediaAccount,
        include: [{
          model: db.Clip,
          attributes: ['views']
        }]
      }],
      where: {
        '$SocialMediaAccounts.Clips.views$': {
          [Op.gt]: 0
        }
      }
    });

    // Calculate total views for each user
    const userStats = users.map(user => ({
      discordId: user.discordId,
      totalViews: user.SocialMediaAccounts.reduce((acc, account) => 
        acc + account.Clips.reduce((sum, clip) => sum + clip.views, 0), 0
      )
    })).sort((a, b) => b.totalViews - a.totalViews);

    // Find requesting user's position
    const userIndex = userStats.findIndex(stat => stat.discordId === req.body.member.user.id);
    
    let response = ['🏆 **Top Clippers**\n'];

    // Add top 5 users
    for (let i = 0; i < Math.min(5, userStats.length); i++) {
      const stat = userStats[i];
      response.push(
        `${i + 1}. <@${stat.discordId}> - ${formatNumber(stat.totalViews)} views`
      );
    }

    // Add requesting user's position if not in top 5
    if (userIndex >= 5) {
      const userStat = userStats[userIndex];
      const nextUserStat = userStats[userIndex - 1];
      const prevUserStat = userStats[userIndex + 1];

      response.push('\n**Your Position**');
      response.push(
        `Rank ${userIndex + 1}/${userStats.length} - ${formatNumber(userStat.totalViews)} views`
      );
      
      if (nextUserStat) {
        const viewsToNext = nextUserStat.totalViews - userStat.totalViews;
        response.push(`Views to next rank: ${formatNumber(viewsToNext)}`);
      }
      
      if (prevUserStat) {
        const viewsAhead = userStat.totalViews - prevUserStat.totalViews;
        response.push(`Views ahead of next rank: ${formatNumber(viewsAhead)}`);
      }
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: response.join('\n')
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'There was an error fetching the leaderboard. Please try again.'
      }
    });
  }
} 