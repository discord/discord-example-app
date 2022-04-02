import 'dotenv/config'
import express from 'express'
import axios from 'axios';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, ComponentType, ButtonStyle, DiscordAPI } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { CHALLENGE_COMMAND, TEST_COMMAND, HasGuildCommands } from './commands.js';

// Create an express app
const app = express();
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({verify: VerifyDiscordRequest(process.env.PUBLIC_KEY)}));

// Create HTTP client instance with token
const client = axios.create({
    headers: {'Authorization': `Bot ${process.env.DISCORD_TOKEN}`}
});

// Store for in-progress games. In production, you'd want to use a DB
let activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', function (req, res) {
    // Interaction type and data
    let { type, id, data } = req.body;

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
        return res.json({ "type": InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND){
        let { name } = data;
        
        // "test" guild command
        if (name === "test") {
             // Send a message into the channel where command was triggered from
            return res.send({
                "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                "data": {
                    // Fetches a random emoji to send from a helper function
                    "content": "hello world " + getRandomEmoji()
                }
            });
        }
        // "challenge" guild command
        if (name === "challenge" && id) {
            let userId = req.body.member.user.id;
            // User's object choice
            let objectName = req.body.data.options[0].value;

            // Create active game using message ID as the game ID
            activeGames[id] = {
                "id": userId,
                "objectName": objectName
            };

            return res.send({
                "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                "data": {
                    // Fetches a random emoji to send from a helper function
                    "content": `Rock papers scissors challenge from <@${userId}>`,
                    "components": [{
                        "type": ComponentType.ACTION,
                        "components": [{
                            "type": ComponentType.BUTTON,
                            // Append the game ID to use later on
                            "custom_id": `accept_button_${req.body.id}`,
                            "label": "Accept",
                            "style": ButtonStyle.PRIMARY
                        }]
                    }]
                }
            });
        }
    }

    /**
     * Handle requests from interactive components
     * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
     */
    if (type === InteractionType.MESSAGE_COMPONENT){
        // custom_id set in payload when sending message component
        let componentId = data.custom_id;

        if (componentId.startsWith('accept_button_')) {
            // get the associated game ID
            let gameId = componentId.replace('accept_button_', '');
            // Delete message with token in request body
            let url = DiscordAPI(`/webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`);
            client({ url, method: 'delete' }).catch(e => console.error(`Error deleting message: ${e}`));

            return res.send({
                "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                "data": {
                    // Fetches a random emoji to send from a helper function
                    "content": "What's your object of choice?",
                    // Indicates it'll be an ephemeral message
                    "flags": 64,
                    "components": [{
                        "type": ComponentType.ACTION,
                        "components": [{
                            "type": ComponentType.SELECT,
                            // Append game ID
                            "custom_id": `select_choice_${gameId}`,
                            "options": getShuffledOptions()
                        }]
                    }]
                }
            });
        } else if (componentId.startsWith('select_choice_')) {
            // get the associated game ID
            let gameId = componentId.replace('select_choice_', '');

            if (activeGames[gameId]) {
                // Get user ID and object choice for responding user
                let userId = req.body.member.user.id;
                let objectName = data.values[0];
                // Calculate result from helper function
                let resultStr = getResult(activeGames[gameId], {id: userId, objectName});

                // Remove game from storage
                delete activeGames[gameId];
                // Update message with token in request body
                let url = DiscordAPI(`/webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`);
                client({ url, method: 'patch', data: {
                    "content": `Nice choice ${getRandomEmoji()}`,
                    "components": []
                }}).catch(e => console.error(`Error deleting message: ${e}`));

                // Send results
                return res.send({
                    "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    "data": { "content": resultStr }
                });
            }
        }
    }
});

app.listen(3000, () => {
    console.log('Listening on port 3000');

    // Check if guild commands from commands.json are installed (if not, install them)
    HasGuildCommands(client, process.env.APP_ID, process.env.GUILD_ID, [TEST_COMMAND, CHALLENGE_COMMAND]);
});