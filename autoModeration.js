import 'dotenv/config'
import { DiscordRequest } from './utils.js'

const createMod = (appId) => {
  const endpoint = `/guilds/${appId}/auto-moderation/rules`

  // const rule = {
  //     name: 'testRule',
  //     event_type: ,
  // }
}

const getChannels = async (appId) => {
  const endpoint = `guilds/921857930490437703`

  let result = null
  try {
    result = await DiscordRequest(endpoint, {})
  } catch (e) {
    console.error(e)
  }
  return result.body
}

const response = await getChannels(process.env.APP_ID)

setTimeout(() => {
  console.log('response: ', response)
}, 3000)
