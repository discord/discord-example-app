import { verifyKey } from 'discord-interactions'

const millToMin = (mil) => Math.round(mil / 60000)

const DiscordRequest = async (endpoint, options, env) => {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body)
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent':
        'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)'
    },
    ...options
  })
  // throw API errors
  if (!res.ok) {
    const data = await res.json()
    console.log(res.status)
    throw new Error(JSON.stringify(data))
  }
  // return original response
  return res
}

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

export { verifyDiscordRequest, JsonResponse, millToMin, DiscordRequest }
