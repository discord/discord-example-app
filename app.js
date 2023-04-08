import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';

import { VerifyDiscordRequest } from './lib/utils.js';

import { testCommand } from './lib/commands/test_command.js';
import { bookSearchCommand } from './lib/commands/booksearch_command.js';
import { shortlistCommand } from './lib/commands/shortlist_command.js';


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Some in-memory state for the time being
const bookClubState = {
  shortlist: {
    books: [],
  },
};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data, token } = req.body;

  console.log(type, id, data, token);

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'test') {
      return testCommand(res);
    } else if (name === 'booksearch') {
      return bookSearchCommand(res, data);
    } else if (name === 'shortlist') {
      return shortlistCommand(res, req, data, bookClubState);
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

