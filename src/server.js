import { Router } from 'itty-router'
import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { JsonResponse, verifyDiscordRequest } from './utils/index.js'
import { COMMANDS } from './constants.js'
import { randomGame } from './actions/randomGame.js'
import { randomAnekdot } from './actions/randomAnekdot.js'
import { joinVoiceChannel } from '@discordjs/voice'

const router = Router()

router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`)
})

router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env
  )
  console.log('interaction: ', interaction)

  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 })
  }

  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG
    })
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    switch (interaction.data.name.toLowerCase()) {
      case COMMANDS.RANDOM_GAME: {
        return randomGame(interaction, env)
      }
      case COMMANDS.ANEKDOT: {
        return randomAnekdot(interaction, env)
      }
      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 })
    }
  }

  console.error('Unknown Type')
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 })
})
router.all('*', () => new Response('Not Found.', { status: 404 }))

const server = {
  verifyDiscordRequest,
  async fetch(request, env) {
    return router.handle(request, env)
  }
}

export default server
