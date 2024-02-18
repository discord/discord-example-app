import games from '../basa/games.js'
import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../utils/index.js'

export const randomGame = (interaction) => {
  const userId = interaction.member.user.id

  const selectedGame = games[Math.floor(Math.random() * games.length)]
  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `<@${userId}> выбрал следующую игру: ${selectedGame}`
    }
  })
}
