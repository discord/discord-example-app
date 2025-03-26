import { InteractionResponseType, InteractionResponseFlags, MessageComponentTypes, ButtonStyleTypes } from 'discord-interactions';
import { getRandomEmoji } from '../utils.js';

export default function handleTest(req, res, member) {
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            // Message content with Discord markdown formatting
        content: `**Hello World!** ${getRandomEmoji()}\n` +
                 '> This is a quoted line\n' +
                 '```\nThis is a code block\n```',
        // Message is shown only to the command user
        flags: InteractionResponseFlags.EPHEMERAL,
        // Optional embeds for richer messages
        embeds: [{
            title: "Welcome Message",
            description: "This is an embedded message",
            color: 0x00ff00, // Green color
            fields: [
                {
                    name: "Field 1",
                    value: "This is a field value",
                    inline: true
                }
            ]
        }],
        // Optional components like buttons
        components: [
            {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: MessageComponentTypes.BUTTON,
                        custom_id: 'welcome_button',
                        label: 'Click Me!',
                        style: ButtonStyleTypes.PRIMARY
                    }
                ]
            }
        ]
        }
    });
}