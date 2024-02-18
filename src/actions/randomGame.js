import games from '../basa/games.js'
import {
  InteractionResponseFlags,
  InteractionResponseType
} from 'discord-interactions'
import { DiscordRequest, JsonResponse, millToMin } from '../utils/index.js'

const lastRequest = {}
const savedGame = {
  name: '',
  time: ''
}
const postMessage = async (env) => {
  // console.log('postMessage')
  // const channelId = '1208455077078110211'
  //
  // await DiscordRequest(
  //   `channels/${channelId}/messages`,
  //   {
  //     method: 'POST',
  //     body: {
  //       content: 'Hello, World!',
  //       tts: false,
  //       embeds: [
  //         {
  //           title: 'Hello, Embed!',
  //           description: 'This is an embedded message.'
  //         }
  //       ]
  //     }
  //   },
  //   env
  // )
}

export const randomGame = async (interaction, env) => {
  const requestTime = new Date().getTime()

  const userId = interaction.member.user.id

  // await postMessage(env)

  if (userId in lastRequest) {
    const timePastFromLastRequest = millToMin(requestTime - lastRequest[userId])

    lastRequest[userId] = new Date().getTime()

    if (timePastFromLastRequest < 2) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `<@${userId}> отдохни сынок немного`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      })
    }
  } else {
    lastRequest[userId] = new Date().getTime()
  }
  const timePastFromLastGameWasSelected =
    savedGame.name && millToMin(new Date().getTime() - savedGame.time)

  if (savedGame.name && timePastFromLastGameWasSelected < 20) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `<@${userId}> игра уже выбрана и это ${savedGame.name}`
      }
    })
  }

  const selectedGame = games[Math.floor(Math.random() * games.length)]

  savedGame.name = selectedGame
  savedGame.time = new Date().getTime()

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `<@${userId}> выбрал следующую игру: ${selectedGame}`
    }
  })
}
