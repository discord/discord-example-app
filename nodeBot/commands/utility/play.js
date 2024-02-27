const { SlashCommandBuilder } = require('discord.js')
const { join } = require('node:path')
const {
  createAudioResource,
  createAudioPlayer,
  getVoiceConnection,
  AudioPlayerStatus,
  VoiceConnectionStatus
} = require('@discordjs/voice')

module.exports = {
  data: new SlashCommandBuilder().setName('play').setDescription('Play music'),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId)
    const resource = createAudioResource(join(__dirname, 'test3.mp3'))
    // resource.volume.setVolume(0.1)
    const player = createAudioPlayer()

    player.play(resource)

    if (connection) {
      const subscription = connection.subscribe(player)

      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(
          'The connection has entered the Ready state - ready to play audio!'
        )
      })

      if (subscription) {
        // Unsubscribe after 5 seconds (stop playing audio on the voice connection)
        setTimeout(() => {
          subscription.unsubscribe()
          connection.destroy()
          interaction.channel.send('Disconnected from voice channel.')
        }, 25000)
      }

      player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!')
      })
      player.on('error', (error) => {
        console.error(`Error: ${error.message} with resource`)
      })
      player.on(AudioPlayerStatus.Idle, () => {
        console.log('Idle')
      })
      connection.on('disconnect', () => {
        interaction.channel.send('Disconnected from voice channel.')
      })
      interaction.channel.send('Playing music...')
    }

    await interaction.reply('Pong!')
  }
}
