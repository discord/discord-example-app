const textToSpeech = require('@google-cloud/text-to-speech')
const fs = require('fs')
const util = require('util')

const client = new textToSpeech.TextToSpeechClient()

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const text = 'Тестовый текст, раз раз раз!'
const outputFile = 'output.mp3'
//Russian (Russia) 	WaveNet 	ru-RU 	ru-RU-Wavenet-B 	MALE
const request = {
  input: { text: text },
  voice: {
    languageCode: 'ru-RU',
    ssmlGender: 'MALE',
    voiceName: 'ru-RU-Wavenet-B'
  },
  audioConfig: { audioEncoding: 'MP3' }
}
client.synthesizeSpeech(request).then(([response]) => {
  const writeFile = util.promisify(fs.writeFile)

  writeFile(outputFile, response.audioContent, 'binary').then((res) => {
    console.log('res: ', res)
    console.log(`Audio content written to file: ${outputFile}`)
  })
})
