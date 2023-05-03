import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
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

// call saul command
const SAUL_COMMAND = {
  name: 'callsaul',
  description: 'Talk to Saul',
  type: 1,
};

const ALL_COMMANDS = [SAUL_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);