import { SlashCommandBuilder } from 'discord.js'
import { getVoiceConnection } from '@discordjs/voice'

export default {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave voice channel!'),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId)

    if (connection) connection.destroy()

    await interaction.reply('Pong!')
  }
}
