import { InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

/**
 * Representes the `/select` command
 */
export const select = {
  name: 'select',
  description: 'Send a message with a select menu',
  type: 1,
  integration_types: [0, 1],
  execute, 
  executeMessageComponent,
};

async function execute() {
  // Send a message with a button
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'A message with a button',
      // Selects are inside of action rows
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.STRING_SELECT,
              // Value for your app to identify the select menu interactions
              custom_id: 'select/my_select',
              // Select options - see https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
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
  };
}

async function executeMessageComponent(body) {
  // custom_id set in payload when sending message component
  const componentId = body.data.custom_id;

  if (componentId === 'select/my_select') {
    // Get selected option from payload
    const selectedOption = body.data.values[0];
    const userId = body.member.user.id;

    // Send results
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `<@${userId}> selected ${selectedOption}` },
    };
  }
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Unknown select menu :(' },
  };
}
