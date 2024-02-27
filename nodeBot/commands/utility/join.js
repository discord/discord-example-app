const { SlashCommandBuilder } = require('discord.js')
const { joinVoiceChannel } = require('@discordjs/voice')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join to voice channel!'),
  async execute(interaction) {
    console.log('interaction: ', interaction)
    const connection = joinVoiceChannel({
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator
    })

    await interaction.reply('Pong!')
  }
}
