import { 
  InteractionResponseType, 
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
 } from 'discord-interactions';

 import { request, getRandomEmoji } from '../utils.js';

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

// this is just to figure out winner + verb
const RPSChoices = {
  rock: {
    description: 'sedimentary, igneous, or perhaps even metamorphic',
    virus: 'outwaits',
    computer: 'smashes',
    scissors: 'crushes',
  },
  cowboy: {
    description: 'yeehaw~',
    scissors: 'puts away',
    wumpus: 'lassos',
    rock: 'steel-toe kicks',
  },
  scissors: {
    description: 'careful ! sharp ! edges !!',
    paper: 'cuts',
    computer: 'cuts cord of',
    virus: 'cuts DNA of',
  },
  virus: {
    description: 'genetic mutation, malware, or something inbetween',
    cowboy: 'infects',
    computer: 'corrupts',
    wumpus: 'infects',
  },
  computer: {
    description: 'beep boop beep bzzrrhggggg',
    cowboy: 'overwhelms',
    paper: 'uninstalls firmware for',
    wumpus: 'deletes assets for',
  },
  wumpus: {
    description: 'the purple Discord fella',
    paper: 'draws picture on',
    rock: 'paints cute face on',
    scissors: 'admires own reflection in',
  },
  paper: {
    description: 'versatile and iconic',
    virus: 'ignores',
    cowboy: 'gives papercut to',
    rock: 'covers',
  },
};

/**
 * Representes the `/challenge` command
 */
export const challenge = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
  execute, 
  executeMessageComponent,
};

async function execute(body) {
  console.log(body);
  // User ID is in user field for (G)DMs, and member for servers
  const userId = body.context === 0 ? body.member.user.id : body.user.id;
  // User's object choice
  const objectName = body.data.options[0].value;

  // Create active game using message ID as the game ID
  activeGames[body.id] = {
    id: userId,
    objectName,
  };

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      // Fetches a random emoji to send from a helper function
      content: `Rock papers scissors challenge from <@${userId}>`,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              // Append the game ID to use later on
              custom_id: `challenge/accept_button_${body.id}`,
              label: 'Accept',
              style: ButtonStyleTypes.PRIMARY,
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

  if (componentId.startsWith('challenge/accept_button_')) {
    // get the associated game ID
    const gameId = componentId.replace('challenge/accept_button_', '');
    
    // Delete the previous message after returning the response
    setImmediate(async () => {
      const endpoint = `webhooks/${process.env.APP_ID}/${body.token}/messages/${body.message.id}`;
      await request(endpoint, { method: 'DELETE' });
    });

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'What is your object of choice?',
        // Indicates it'll be an ephemeral message
        flags: InteractionResponseFlags.EPHEMERAL,
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.STRING_SELECT,
                // Append game ID
                custom_id: `challenge/select_choice_${gameId}`,
                options: getShuffledOptions(),
              },
            ],
          },
        ],
      }
    }
  } 
  
  if (componentId.startsWith('challenge/select_choice_')) {
    // get the associated game ID
    const gameId = componentId.replace('challenge/select_choice_', '');

    if (activeGames[gameId]) {
      // Interaction context
      const context = body.context;
      // Get user ID and object choice for responding user
      // User ID is in user field for (G)DMs, and member for servers
      const userId = context === 0 ? body.member.user.id : body.user.id;
      const objectName = body.data.values[0];
      // Calculate result from helper function
      const resultStr = getResult(activeGames[gameId], {
        id: userId,
        objectName,
      });

      // Remove game from storage
      delete activeGames[gameId];
      // Update message with token in request body
      const endpoint = `webhooks/${process.env.APP_ID}/${body.token}/messages/${body.message.id}`;

      setImmediate(async () => {
        // Update ephemeral message
        await request(endpoint, {
          method: 'PATCH',
          body: {
            content: `Nice choice ${getRandomEmoji()}`,
            components: [],
          },
        });
      });
      
      // Send results
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: resultStr },
      };
    }
  }
}

function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

function getResult(p1, p2) {
  let gameResult;
  if (RPSChoices[p1.objectName] && RPSChoices[p1.objectName][p2.objectName]) {
    // o1 wins
    gameResult = {
      win: p1,
      lose: p2,
      verb: RPSChoices[p1.objectName][p2.objectName],
    };
  } else if (
    RPSChoices[p2.objectName] &&
    RPSChoices[p2.objectName][p1.objectName]
  ) {
    // o2 wins
    gameResult = {
      win: p2,
      lose: p1,
      verb: RPSChoices[p2.objectName][p1.objectName],
    };
  } else {
    // tie -- win/lose don't
    gameResult = { win: p1, lose: p2, verb: 'tie' };
  }

  return formatResult(gameResult);
}

function formatResult(result) {
  const { win, lose, verb } = result;
  return verb === 'tie'
    ? `<@${win.id}> and <@${lose.id}> draw with **${win.objectName}**`
    : `<@${win.id}>'s **${win.objectName}** ${verb} <@${lose.id}>'s **${lose.objectName}**`;
}

function getRPSChoices() {
  return Object.keys(RPSChoices);
}

// Function to fetch shuffled options for select menu
export function getShuffledOptions() {
  const allChoices = getRPSChoices();
  const options = [];

  for (let c of allChoices) {
    // Formatted for select menus
    // https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
    options.push({
      label: capitalize(c),
      value: c.toLowerCase(),
      description: RPSChoices[c]['description'],
    });
  }

  return options.sort(() => Math.random() - 0.5);
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
