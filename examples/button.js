import 'dotenv/config'
import express from 'express'
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, ComponentType, ButtonStyle } from './utils.js';

// Create and configure express app
const app = express();
app.use(express.json({verify: VerifyDiscordRequest(process.env.PUBLIC_KEY)}));

app.post('/interactions', function (req, res) {
    // Interaction type and data
    let { type, data } = req.body;
    /**
     * Handle slash command requests
     */
    if (type === InteractionType.APPLICATION_COMMAND){
        // Slash command with name of "test"
        if (data.name === "test") {
            // Send a message with a button
            return res.send({
                "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                "data": {
                    "content": 'A message with a button',
                    // Buttons are inside of action rows
                    "components": [{
                        "type": ComponentType.ACTION,
                        "components": [{
                            "type": ComponentType.BUTTON,
                            // Value for your app to identify the button
                            "custom_id": "my_button",
                            "label": "Click",
                            "style": ButtonStyle.PRIMARY
                        }]
                    }]
                }
            });
        }
    }

    /**
     * Handle requests from interactive components
     */
    if (type === InteractionType.MESSAGE_COMPONENT){
        // custom_id set in payload when sending message component
        let componentId = data.custom_id;
        // user who clicked button
        let userId = req.body.member.user.id;

        if (componentId === 'my_button') {
            console.log(req.body);
            return res.send({
                "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                "data": { "content": `<@${userId} clicked the button` }
            });
        }
    }
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});