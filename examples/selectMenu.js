import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';

// Create and configure express app
const app = express();

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), function (req, res) {
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
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          // Selects are inside of action rows
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: 'What is your object of choice?',
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  // Value for your app to identify the select menu interactions
                  custom_id: 'my_select',
                  // Select options - see https://discord.com/developers/docs/components/reference#string-select
                  options: [
                    {
                      label: 'Option #1',
                      value: 'option_1',
                      description: 'The very first option',
                    },
                    {
                      label: 'Second option',
                      value: 'option_2',
                      description: 'The second AND last option',
                    },
                  ],
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

    if (componentId === 'my_select') {
      console.log(req.body);

      // Get selected option from payload
      const selectedOption = data.values[0];
      const userId = req.body.member.user.id;

      // Send results
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `<@${userId}> selected ${selectedOption}` },
      });
    }
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
