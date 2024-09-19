import { InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

/**
 * Representes the `/modal` command
 */
export const modal = {
  name: 'modal',
  description: 'Send a message with a modal',
  type: 1,
  integration_types: [0, 1],
  execute, 
  executeModalSubmit,
}

async function execute() {
  // Send a modal as response
  return {
    type: InteractionResponseType.MODAL,
    data: {
      custom_id: 'modal/my_modal',
      title: 'Modal title',
      components: [
        {
          // Text inputs must be inside of an action component
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              // See https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
              type: MessageComponentTypes.INPUT_TEXT,
              custom_id: 'my_text',
              style: 1,
              label: 'Type some text',
            },
          ],
        },
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.INPUT_TEXT,
              custom_id: 'my_longer_text',
              // Bigger text box for input
              style: 2,
              label: 'Type some (longer) text',
            },
          ],
        },
      ],
    },
  };
}

async function executeModalSubmit(body) {
  // custom_id of modal
  const modalId = body.data.custom_id;
  // user ID of member who filled out modal
  const userId = body.member.user.id;

  if (modalId === 'modal/my_modal') {
    let modalValues = '';
    // Get value of text inputs
    for (let action of body.data.components) {
      let inputComponent = action.components[0];
      modalValues += `${inputComponent.custom_id}: ${inputComponent.value}\n`;
    }

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `<@${userId}> typed the following (in a modal):\n\n${modalValues}`,
      },
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Unknown modal :(' },
  };
}
