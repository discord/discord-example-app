import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import {
  handleRegister,
  handleAddAccount,
  handleVerifyStatus,
  handleUpload,
  handleStats,
  handleLeaderboard,
  handleTest
} from './handlers/index.js';

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data, member } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    switch (name) {
      case 'test':
        return handleTest(req, res, member);

      case 'register':
        return handleRegister(req, res, member);
      
      case 'add-account':
        return handleAddAccount(req, res, member, options);
      
      case 'verify-status':
        return handleVerifyStatus(req, res, member, options);
      
      case 'upload':
        return handleUpload(req, res, member, options);
      
      case 'stats':
        return handleStats(req, res, member);
      
      case 'leaderboard':
        return handleLeaderboard(req, res);
      
      default:
        console.error(`Unknown command: ${name}`);
        return res.status(400).json({ error: 'Unknown command' });
    }
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
