import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
  MessageComponentTypes,
} from 'discord-interactions';
import {
  handleRegister,
  handleAddAccount,
  handleVerifyStatus,
  handleUpload,
  handleStats,
  handleLeaderboard,
  handleTest,
  handleSetupRegister
} from './handlers/index.js';

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data, member, guild } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Add handling for button interactions
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const { custom_id } = data;
    
    if (custom_id === 'register_button') {
      // Return an ephemeral message (only visible to the user)
      return handleRegister(req, res, guild, member, true);
    }
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    switch (name) {
      case 'test':
        return handleTest(req, res, member);

      case 'register':
        return handleRegister(req, res, guild, member);
      
      case 'add-account':
        return handleAddAccount(req, res, member, options);
      
      case 'verify-status':
        return handleVerifyStatus(req, res, guild, member, options);
      
      case 'upload':
        return handleUpload(req, res, member, options);
      
      case 'stats':
        return handleStats(req, res, member);
      
      case 'leaderboard':
        return handleLeaderboard(req, res);
      
      case 'setup-register':
        // Handle setting up the registration channel
        return handleSetupRegister(req, res, guild);
      
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
