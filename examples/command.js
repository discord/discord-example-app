import 'dotenv/config'
import express from 'express'
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, DiscordAPI } from '../utils.js';
import axios from 'axios';

// Create and configure express app
const app = express();
app.use(express.json({verify: VerifyDiscordRequest(process.env.PUBLIC_KEY)}));

app.post('/interactions', function (req, res) {
    // Interaction type and data
    const { type, data } = req.body;
    /**
     * Handle slash command requests
     */
    if (type === InteractionType.APPLICATION_COMMAND){
        // Slash command with name of "test"
        if (data.name === "test") {
            // Send a message as response
            return res.send({
                "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                "data": { "content": "A wild message appeared" }
            });
        }
    }
});

function createCommand() {
    const appId = process.env.APP_ID;
    const guildId = process.env.GUILD_ID;
    
    /**
     * Globally-scoped slash commands (generally only recommended for production)
     * See https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
     */
    // const globalUrl = DiscordAPI(`applications/${appId}/commands`);
    
    /**
     * Guild-scoped slash commands
     * See https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
     */
    const guildUrl = DiscordAPI(`applications/${appId}/guilds/${guildId}/commands`);
    const commandBody = {
        "name": "test",
        "description": "Just your average command",
        // chat command (see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types)
        "type": 1
    };

    try {
        // Send HTTP request with bot token
        let res = await axios({
            url: guildUrl,
            method: 'post',
            data: commandBody,
            headers: {'Authorization': `Bot ${process.env.DISCORD_TOKEN}`}
        });
        console.log(res.body);
    } catch (err) {
        console.error('Error installing commands: ', err);
    }
    
}

app.listen(3000, () => {
    console.log('Listening on port 3000');

    createCommand();
});
