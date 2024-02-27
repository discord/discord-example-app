const { SlashCommandBuilder } = require('discord.js')
const { getVoiceConnection } = require('@discordjs/voice')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave voice channel!'),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId)

    connection.destroy()

    await interaction.reply('Pong!')
  }
}
