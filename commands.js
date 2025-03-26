import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};


const REGISTER_COMMAND = {
  name: 'register',
  description: 'Register your social media accounts',
  type: 1,
};

const ADD_ACCOUNT_COMMAND = {
  name: 'add-account',
  description: 'Add a new social media account',
  options: [
    {
      type: 3,
      name: 'platform',
      description: 'Social media platform',
      required: true,
      choices: [
        { name: 'Instagram', value: 'INSTAGRAM' },
        { name: 'TikTok', value: 'TIKTOK' },
        { name: 'YouTube', value: 'YOUTUBE' },
        { name: 'X', value: 'X' }
      ]
    },
    {
      type: 3,
      name: 'username',
      description: 'Your username on the platform',
      required: true
    }
  ],
  type: 1
};

const VERIFY_STATUS_COMMAND = {
  name: 'verify-status',
  description: 'Check verification status of your account',
  options: [
    {
      type: 3,
      name: 'platform',
      description: 'Social media platform',
      required: true,
      choices: [
        { name: 'Instagram', value: 'INSTAGRAM' },
        { name: 'TikTok', value: 'TIKTOK' },
        { name: 'YouTube', value: 'YOUTUBE' },
        { name: 'X', value: 'X' }
      ]
    },
    {
      type: 3,
      name: 'username',
      description: 'Username to check',
      required: true
    }
  ],
  type: 1
};

const UPLOAD_COMMAND = {
  name: 'upload',
  description: 'Upload clips for tracking',
  options: [
    {
      type: 3,
      name: 'urls',
      description: 'Clip URLs (up to 10, separated by commas)',
      required: true
    }
  ],
  type: 1
};

const STATS_COMMAND = {
  name: 'stats',
  description: 'View your engagement metrics',
  type: 1
};

const LEADERBOARD_COMMAND = {
  name: 'leaderboard',
  description: 'View community leaderboard',
  type: 1
};

const ALL_COMMANDS = [
  TEST_COMMAND,
  REGISTER_COMMAND,
  ADD_ACCOUNT_COMMAND,
  VERIFY_STATUS_COMMAND,
  UPLOAD_COMMAND,
  STATS_COMMAND,
  LEADERBOARD_COMMAND
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
