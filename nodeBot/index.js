import { Client, Collection, GatewayIntentBits } from 'discord.js'
import config from './config.json' assert { type: 'json' }

import InteractionCreate from './events/interactionCreate.js'
import MessageCreate from './events/messageCreate.js'
import Ready from './events/ready.js'

import Join from './commands/utility/join.js'
import Leave from './commands/utility/leave.js'
import Ping from './commands/utility/ping.js'
import Play from './commands/utility/play.js'
import Server from './commands/utility/server.js'
import User from './commands/utility/user.js'

const commands = [Join, Leave, Play, Ping, Server, User]
const events = [MessageCreate, InteractionCreate, Ready]

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ]
})

client.commands = new Collection()

commands.forEach((command) => {
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    )
  }
})

events.forEach((event) => {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
})

client.login(config.token)
