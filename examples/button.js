import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest } from '../utils.js';

// Create and configure express app
const app = express();
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;
  /**
   * Handle slash command requests
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    // Slash command with name of "test"
    if (data.name === 'test') {
      // Send a message with a button
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'A message with a button',
          // Buttons are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'my_button',
                  label: 'Click',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }
  }

  /**
   * Handle requests from interactive components
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
    // user who clicked button
    const userId = req.body.member.user.id;

    if (componentId === 'my_button') {
      console.log(req.body);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `<@${userId} clicked the button` },
      });
    }
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
