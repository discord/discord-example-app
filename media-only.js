import { isMediaOnlyChannel } from './database.js';

const mediaFileExtensionPattern =
  /\.(?:apng|avif|gif|jpe?g|m4v|mov|mp4|png|webm|webp)$/i;

export function hasAllowedMedia(message) {
  if (message.stickers.size > 0) {
    return true;
  }

  for (const attachment of message.attachments.values()) {
    const contentType = attachment.contentType?.toLowerCase();

    if (
      contentType?.startsWith('image/') ||
      contentType?.startsWith('video/') ||
      mediaFileExtensionPattern.test(attachment.name ?? '')
    ) {
      return true;
    }
  }

  return false;
}

export async function enforceMediaOnlyMessage(message) {
  if (
    !message.inGuild() ||
    message.author.bot ||
    message.system ||
    !(await isMediaOnlyChannel(message.guildId, message.channelId)) ||
    hasAllowedMedia(message)
  ) {
    return false;
  }

  await message.delete();
  return true;
}
