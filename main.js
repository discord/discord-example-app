import 'dotenv/config'
import { Client, GatewayIntentBits, Events } from 'discord.js'
import { COMMANDS } from './constants.js'
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
})

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  console.log('interaction: ', interaction)

  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === COMMANDS.LOX) {
    await interaction.reply('Pong!')
  }
})

console.log('discord token: ', process.env.DISCORD_TOKEN)

client.login(process.env.DISCORD_TOKEN)
