import config from '../config.json' assert { type: 'json' }
const url = 'https://api.fireworks.ai/inference/v1/chat/completions'

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.chatKey}`
}
const fetchChat = async (text) => {
  let response = {}
  const options = {
    model: 'accounts/fireworks/models/firefunction-v1',
    max_tokens: 4096,
    top_p: 1,
    top_k: 40,
    presence_penalty: 0,
    frequency_penalty: 0,
    temperature: 0.6,
    messages: [
      {
        content: text,
        role: 'user'
      }
    ]
  }
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(options)
    })
    response = await response.json()
  } catch (e) {
    console.error(e)
  }

  return response.choices[0].message.content
}

export default async (text) => {
  return await fetchChat(text)
}
