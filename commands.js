import 'dotenv/config';
import { getViolationDescription, getViolations } from './violations.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from violations.js
function createCommandChoices() {
  const violations = getViolations();
  const commandChoices = [];

  for (let violation of violations) {
    commandChoices.push({
      name: capitalize(violation),
      value: getViolationDescription(violation),
    });
  }

  return commandChoices;
}

const LIST_OPEN_SHOTS_COMMAND = {
  name: 'list_open_shots',
  description: 'List all open shots',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};


// Command containing options
const SHOT_COMMAND = {
  name: 'shot',
  description: 'Note a shot for a player due to a violation',
// options: [
//   {
//     type: 3,
//     name: 'violation',
//     description: 'Pick the violation',
//     required: false,
//     choices: createCommandChoices(),
//   },
//   {
//     type: 3,
//     name: 'username',
//     description: 'Tag the user who has to take the shot (starting with @)',
//     required: false,
//   },
// ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [LIST_OPEN_SHOTS_COMMAND, SHOT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
