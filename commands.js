import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';


export const COMMANDS = {
  LIST_OPEN_SHOTS_COMMAND: {
    name: 'list_open_shots',
    description: 'List all open shots',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 2],
  },

  REDEEM_SHOT_COMMAND: {
    name: 'redeem_shot',
    description: 'Redeem a shot for yourself',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 2],
  },

  SHOT_COMMAND: {
    name: 'shot',
    description: 'Add a shot for a player due to a violation',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 2],
  },

  MOTIVATE_TTS_COMMAND: {
    name: 'motivate_tts',
    description: 'Motivate a player using TTS',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 2],
  },

  // const SHOT_NON_INTERACTIVE_COMMAND = {
  //   name: 'shot',
  //   description: 'Add a shot for a player due to a violation',
  //   type: 1,
  //   integration_types: [0],
  //   contexts: [0],
  //   options: [
  //     {
  //       name: 'user',
  //       description: 'The user to add a shot for',
  //       type: 6,
  //       required: true,
  //     },
  //     {
  //       name: 'violation_type',
  //       description: 'The violation type',
  //       type: 3,
  //       required: true,
  //       choices: [
  //         { name: 'Violation 1', value: 'violation_1' },
  //         { name: 'Violation 2', value: 'violation_2' },
  //         { name: 'Violation 3', value: 'violation_3' },
  //       ],
  //     },
  //   ],
  // };

}
const ALL_COMMANDS = Object.values(COMMANDS);

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
