const { SlashCommandBuilder } = require('discord.js')
const { join } = require('node:path')
const {
  createAudioResource,
  createAudioPlayer,
  NoSubscriberBehavior,
  getVoiceConnection
} = require('@discordjs/voice')

module.exports = {
  data: new SlashCommandBuilder().setName('play').setDescription('Play music'),
  async execute(interaction) {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
      }
    })
    const connection = getVoiceConnection(interaction.guildId)
    console.log('connection: ', connection)

    const resource = createAudioResource(join(__dirname, '../test.mp3'))
    player.play(resource)
    connection.subscribe(player)

    await interaction.reply('Pong!')
  }
}
