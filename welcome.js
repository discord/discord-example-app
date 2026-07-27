import { EmbedBuilder } from 'discord.js';

import { getWelcomeSettings } from './database.js';

export function renderWelcomeTemplate(template, member) {
  return template
    .replaceAll('{user}', `<@${member.id}>`)
    .replaceAll('{server}', member.guild.name);
}

export function buildWelcomeMessage(settings, member) {
  const allowedMentions = {
    parse: [],
    users: [member.id],
    repliedUser: false,
  };
  const body = renderWelcomeTemplate(settings.bodyTemplate, member);

  if (settings.format === 'PLAIN_TEXT') {
    return {
      content: body,
      allowedMentions,
    };
  }

  const embed = new EmbedBuilder()
    .setDescription(body)
    .setColor(settings.embedColor ?? '#36d38d');

  if (settings.titleTemplate) {
    embed.setTitle(renderWelcomeTemplate(settings.titleTemplate, member));
  }

  if (settings.includeTimestamp) {
    embed.setTimestamp();
  }

  return {
    embeds: [embed],
    allowedMentions,
  };
}

export async function sendWelcomeMessage(member) {
  if (member.user.bot) {
    return;
  }

  const settings = await getWelcomeSettings(member.guild.id);

  if (!settings) {
    return;
  }

  const channel = await member.guild.channels.fetch(settings.channelId);

  if (!channel?.isTextBased() || !channel.isSendable()) {
    throw new Error(
      `Welcome channel ${settings.channelId} is unavailable in guild ${member.guild.id}`,
    );
  }

  await channel.send(buildWelcomeMessage(settings, member));
}
