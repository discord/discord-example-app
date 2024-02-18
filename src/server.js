import { Router } from 'itty-router'
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
  InteractionResponseFlags
} from 'discord-interactions'

const router = Router()
const verifyDiscordRequest = async (request, env) => {
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

const server = {
  verifyDiscordRequest,
  /**
   * Every request to a worker will start in the `fetch` method.
   * Verify the signature with the request, and dispatch to the router.
   * @param {*} request A Fetch Request object
   * @param {*} env A map of key/value pairs with env vars and secrets from the cloudflare env.
   * @returns
   */
  async fetch(request, env) {
    return router.handle(request, env)
  }
}

export default server
