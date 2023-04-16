import config from './lib/config.js';
import express, { Express, Request, Response } from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

import { VerifyDiscordRequest } from './lib/utils.js';

import { BookClubState } from './lib/types/BookClubState.js';
import CommandFactory from './lib/commands/CommandFactory.js';
import MessageActionFactory from './lib/message_actions/MessageActionFactory.js';

// Create an express app
const app: Express = express();
// Get port, or default to 3000
const PORT = config.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(config.PUBLIC_KEY) }));

// Some in-memory state for the time being
const bookClubState: BookClubState = {
    shortlist: {
        books: [],
    },
    vote: {
        books: [],
        votes: [],
    },
    events: [],
};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req: Request, res: Response) {
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

        const command = CommandFactory.getCommand(name);
        return command.execute(req, res, bookClubState);
    }

    if (type === InteractionType.MESSAGE_COMPONENT) {
        // This is used for responses through our message UI components

        const { custom_id } = data;
        const action = MessageActionFactory.getAction(custom_id);
        return action.execute(req, res, bookClubState);
    }

    console.warn('Unhandled request');
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
