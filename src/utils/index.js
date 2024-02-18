import { verifyKey } from 'discord-interactions'

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

export { verifyDiscordRequest, JsonResponse }
