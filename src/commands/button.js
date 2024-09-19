import { 
  InteractionResponseType, 
  MessageComponentTypes,
  ButtonStyleTypes,
 } from 'discord-interactions';

 /**
 * Representes the `/button` command
 */
export const button = {
  name: 'button',
  description: 'Send a message with a button',
  type: 1,
  integration_types: [0, 1],
  execute, 
  executeMessageComponent,
};

/**
 * Method run as a result of running `/button`
 * @param {*} body 
 * @returns The JSON returned to the Discord API
 */
async function execute(body) {
  // Send a message with a button
  return {
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
              custom_id: 'button/my_button',
              label: 'Click',
              style: ButtonStyleTypes.PRIMARY,
            },
          ],
        },
      ],
    },
  };
}

/**
 * Method run as a result of clicking the button in the original message.
 * @param {*} body 
 * @returns The JSON returned to the Discord API
 */
async function executeMessageComponent(body) {
  // custom_id set in payload when sending message component
  const componentId = body.data.custom_id;
  // user who clicked button
  const userId = body.member.user.id;

  if (componentId === 'button/my_button') {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `<@${userId}> clicked the button` },
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Unknown button :(' },
  };
}
