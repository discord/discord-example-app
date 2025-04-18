import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const LIST_OPEN_SHOTS_COMMAND = {
  name: 'list_open_shots',
  description: 'List all open shots',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const REDEEM_SHOT_COMMAND = {
  name: 'redeem_shot',
  description: 'Redeem a shot for yourself',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// Command containing options
const SHOT_COMMAND = {
  name: 'shot',
  description: 'Add a shot for a player due to a violation',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [LIST_OPEN_SHOTS_COMMAND, SHOT_COMMAND, REDEEM_SHOT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
