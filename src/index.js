import { Client, Collection, Events, GatewayIntentBits } from 'discord.js'
import config from '../config.json' assert { type: 'json' }
import server from './commands/server.js'
const commands = [server]
// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
})
client.commands = new Collection()

commands.forEach((command) => client.commands.set(command.data.name, command))
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})
client.on(Events.InteractionCreate, async (message) => {
  console.log('message: ', message)
})
console.log('config.DISCORD_TOKEN: ', config.DISCORD_TOKEN)
console.log('Events.InteractionCreate: ', Events.InteractionCreate)
// Log in to Discord with your client's token
client.login(config.DISCORD_TOKEN)
