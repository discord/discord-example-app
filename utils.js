import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      return res.status(401).end('Bad request signature');
    }
  }
}

export function DiscordAPI(url) { return 'https://discord.com/api/v9/' + url };

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  let emojiList = ['😭', '😄', '😌', '🤓', '😎', '😤', '🤖', '😶‍🌫️', '🌏', '📸', '💿', '👋', '🌊', '✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const ComponentType = {
    ACTION: 1,
    BUTTON: 2,
    SELECT: 3,
    INPUT: 4
}

export const ButtonStyle = {
    PRIMARY: 1,
    SECONDARY: 2,
    SUCCESS: 3,
    DANGER: 4,
    LINK: 5
}
