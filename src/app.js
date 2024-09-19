import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { commands } from './commands/index.js';

// Create an express app
const app = express();

// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

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
    const command = commands.find((command) => command.name === name);
    
    if (!command) {
      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: 'unknown command' });
    }

    const response = await command.execute(req.body);
    return res.json(response);
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    // In our components, we're using the naming convetion of `command/custom_id` for identifying
    // components.  This makes it possible to map a component to a command. 
    const [name] = data.custom_id.split('/');
    const command = commands.find((command) => command.name === name);
    
    if (!command) {
      console.error(`unknown message component: ${name}`);
      return res.status(400).json({ error: 'unknown message component' });
    }

    const response = await command.executeMessageComponent(req.body);
    return res.json(response);
  }

  if (type === InteractionType.MODAL_SUBMIT) {
    // In our components, we're using the naming convetion of `command/custom_id` for identifying
    // components.  This makes it possible to map a component to a command. 
    const [name] = data.custom_id.split('/');
    const command = commands.find((command) => command.name === name);
    
    if (!command) {
      console.error(`unknown modal: ${name}`);
      return res.status(400).json({ error: 'unknown modal' });
    }

    const response = await command.executeModalSubmit(req.body);
    return res.json(response);
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
