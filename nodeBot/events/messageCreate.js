import { Events, MessageMentions } from 'discord.js'
import { generate } from '../utils/createAudio.js'
import Play from '../commands/utility/play.js'
import chatApi from '../utils/chatApi.js'
function getUserFromMention(mention) {
  const matches = mention
    .matchAll(MessageMentions.GlobalUsersPattern)
    .next().value

  if (!matches) return

  return matches[1]
}

export default {
  name: Events.MessageCreate,
  async execute(message) {
    const id = getUserFromMention(message.content)

    if (id === '1208462220296720475') {
      const msg = message.content.slice(22).trim()

      const answer = await chatApi(msg)

      await generate(answer)

      setTimeout(async () => {
        await Play.execute(message)
      }, 500)
    }
  }
}
