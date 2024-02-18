import { Router } from 'itty-router'
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKey
} from 'discord-interactions'
import { AWW_COMMAND, INVITE_COMMAND } from './commands.js'

const verifyDiscordRequest = async (request, env) => {
  console.log('env.DISCORD_PUBLIC_KEY: ', env.DISCORD_PUBLIC_KEY)
  const signature = request.headers.get('x-signature-ed25519')
  const timestamp = request.headers.get('x-signature-timestamp')
  const body = await request.text()
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY)

  if (!isValidRequest) {
    return { isValid: false }
  }
  return { interaction: JSON.parse(body), isValid: true }
}

const router = Router()

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body)
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF=8'
      }
    }
    super(jsonBody, init)
  }
}

router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`)
})

router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env
  )
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 })
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG
    })
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (interaction.data.name.toLowerCase()) {
      case AWW_COMMAND.name.toLowerCase(): {
        // const cuteUrl = await getCuteUrl()
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'cuteUrl'
          }
        })
      }
      case INVITE_COMMAND.name.toLowerCase(): {
        const applicationId = env.DISCORD_APPLICATION_ID
        const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: INVITE_URL,
            flags: InteractionResponseFlags.EPHEMERAL
          }
        })
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
