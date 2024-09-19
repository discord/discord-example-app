import 'dotenv/config';
import { commands } from './commands/index.js';
import {request} from './utils.js';

/**
 * This is a standalone script that registers commands with Discord.
 * To run this script, run `npm run register`.
 */

const appId = process.env.APP_ID;
if (!appId) {
  throw new Error('APP_ID is required in .env');
}

// API endpoint to overwrite global commands
const endpoint = `applications/${appId}/commands`;

// This is calling the bulk overwrite endpoint: 
// https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
const res = await request(endpoint, { method: 'PUT', body: commands });
const data = await res.json();
console.log(data);
console.log(`Registered ${data.length} commands`);
