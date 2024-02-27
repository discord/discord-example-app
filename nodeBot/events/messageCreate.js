import { Events, MessageMentions } from 'discord.js'

function getUserFromMention(mention) {
  const matches = mention
    .matchAll(MessageMentions.GlobalUsersPattern)
    .next().value

  if (!matches) return

  return matches[1]
}

export default {
  name: Events.MessageCreate,
  execute(message) {
    const id = getUserFromMention(message.content)

    if (id === '1208462220296720475') {
      console.log('message to bot, message: ', message.content)
    }
  }
}
