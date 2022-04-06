import { getRPSChoices } from "./game.js";
import { capitalize, DiscordAPI } from "./utils.js";

export function HasGuildCommands(client, appId, guildId, commands) {
    if (guildId === '' || appId === '') return;

    commands.forEach((c) => HasGuildCommand(client, appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(client, appId, guildId, command) {
    // API URL to get and post guild commands
    const url = DiscordAPI(`applications/${appId}/guilds/${guildId}/commands`);

    try {
        const { data } = await client({ url, method: 'get'});
        if (data) {
            const installedNames = data.map((c) => c["name"]);
            // This is just matching on the name, so it's not good for updates
            if (!installedNames.includes(command["name"])) {
                await InstallGuildCommand(client, appId, guildId, command);
            } else {
                console.log(`"${command["name"]}" command already installed`)
            }
        }
    } catch (e) {
        console.error(`Error installing commands: ${e}`)
    }
}

// Installs a command
export async function InstallGuildCommand(client, appId, guildId, command) {
    // API URL to get and post guild commands
    const url = DiscordAPI(`applications/${appId}/guilds/${guildId}/commands`);
    // install command
    return client({ url, method: 'post', data: command});
}

// Get the game choices from game.js
function createCommandChoices() {
    const choices = getRPSChoices();
    const commandChoices = [];

    for (let choice of choices) {
        commandChoices.push({
            "name": capitalize(choice),
            "value": choice.toLowerCase()
        });
    }

    return commandChoices;
}

// Simple test command
export const TEST_COMMAND = {
    "name": "test",
    "description": "Basic guild command",
    "type": 1
};

// Command containing options
export const CHALLENGE_COMMAND = {
    "name": "challenge",
    "description": "Challenge to a match of rock paper scissors",
    "options": [
        {
            "type": 3,
            "name": "object",
            "description": "Pick your object",
            "required": true,
            "choices": createCommandChoices()
        }
    ],
    "type": 1
};
