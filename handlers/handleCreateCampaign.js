import { InteractionResponseType, InteractionResponseFlags} from 'discord-interactions';
import { SlashCommandBuilder } from '@discordjs/builders';
import db from '../models/index.js';
import client from '../utils/discordClient.js';



export default async function handleCreateCampaign(req, res, guild, member, options) {
  const ANNOUNCEMENT_CHANNEL_ID = '1354216779374792805';
  
  try {
    // Extract all options from the options array

    console.log(options);
    const name = options.find(opt => opt.name === 'name')?.value;
    const description = options.find(opt => opt.name === 'description')?.value;
    const rate = Number(options.find(opt => opt.name === 'rate')?.value);
    const maxPayout = Number(options.find(opt => opt.name === 'max-payout')?.value);
    const serverUrl = options.find(opt => opt.name === 'server-url')?.value;
    const endDateStr = options.find(opt => opt.name === 'end-date')?.value;
    const guildId = options.find(opt => opt.name === 'guild-id')?.value;

    // Send immediate response
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Creating campaign...',
        flags: InteractionResponseFlags.EPHEMERAL,
      }
    });

    // Validate end date if provided
    let endDate = null;
    if (endDateStr) {
      endDate = new Date(endDateStr);
      if (isNaN(endDate.getTime())) {
        await sendDM(member.user.id, 'Invalid end date format. Please use YYYY-MM-DD');
        return;
      }
    }

    // Create the campaign
    const campaign = await db.Campaign.create({
      name,
      description,
      rate,
      maxPayout,
      serverUrl,
      endDate,
      discordGuildId: guildId,
      status: 'DRAFT',
      totalViews: 0,
      totalLikes: 0
    });

    // Post announcement in the specified channel
    try {
      const channel = await client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
      await channel.send({
        embeds: [{
          title: '🎉 New Campaign Created!',
          color: 0x00ff00, // Green color
          fields: [
            { name: 'Campaign Name', value: name, inline: false },
            { name: 'Rate per View/Like', value: `$${rate}`, inline: true },
            { name: 'Maximum Payout', value: `$${maxPayout}`, inline: true },
            { name: 'Server Link', value: serverUrl, inline: false },
            ...(description ? [{ name: 'Description', value: description, inline: false }] : []),
            ...(endDate ? [{ name: 'End Date', value: endDate.toLocaleDateString(), inline: true }] : [])
          ],
          footer: {
            text: `Campaign ID: ${campaign.id}`
          },
          timestamp: new Date()
        }]
      });
    } catch (error) {
      console.error('Error posting campaign announcement:', error);
      await sendDM(member.user.id, 'Campaign created but failed to post announcement.');
      return;
    }

    // Send confirmation DM to creator
    await sendDM(member.user.id, `Campaign "${name}" created successfully!\nID: ${campaign.id}\nStatus: ${campaign.status}`);

  } catch (error) {
    console.error('Error creating campaign:', error);
    await sendDM(member.user.id, 'There was an error creating the campaign. Please try again.');
  }
}

async function sendDM(userId, content) {
  try {
    if (!client.isReady()) {
      throw new Error('Discord client is not ready');
    }

    const user = await client.users.fetch(userId);
    await user.send({ content });
    console.log(`Sent campaign creation results DM to ${user.tag}`);
  } catch (error) {
    console.error('Failed to send DM:', error);
  }
}


