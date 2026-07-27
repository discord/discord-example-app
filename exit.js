import { EmbedBuilder } from 'discord.js';

import { getExitSettings } from './database.js';

export function renderExitTemplate(template, member) {
  return template
    .replaceAll('{user}', `@${member.user.username}`)
    .replaceAll('{server}', member.guild.name);
}

export function buildExitMessage(settings, member) {
  const allowedMentions = {
    parse: [],
    users: [],
    roles: [],
    repliedUser: false,
  };
  const body = renderExitTemplate(settings.bodyTemplate, member);

  if (settings.format === 'PLAIN_TEXT') {
    return {
      content: body,
      allowedMentions,
    };
  }

  const embed = new EmbedBuilder()
    .setDescription(body)
    .setColor(settings.embedColor ?? '#912d08');

  if (settings.titleTemplate) {
    embed.setTitle(renderExitTemplate(settings.titleTemplate, member));
  }

  if (settings.includeTimestamp) {
    embed.setTimestamp();
  }

  return {
    embeds: [embed],
    allowedMentions,
  };
}

export async function sendExitMessage(member) {
  if (member.user.bot) {
    return;
  }

  const settings = await getExitSettings(member.guild.id);

  if (!settings) {
    return;
  }

  const channel = await member.guild.channels.fetch(settings.channelId);

  if (!channel?.isTextBased() || !channel.isSendable()) {
    throw new Error(
      `Exit channel ${settings.channelId} is unavailable in guild ${member.guild.id}`,
    );
  }

  await channel.send(buildExitMessage(settings, member));
}
