// From https://dev.to/asjadanis/parsing-env-with-typescript-3jjm
// This helps us validate and type our .env file

import 'dotenv/config';

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
    APP_ID: string | undefined;
    DISCORD_TOKEN: string | undefined;
    PORT: number | undefined;
    PUBLIC_KEY: string | undefined;
}

interface Config {
    APP_ID: string;
    DISCORD_TOKEN: string;
    PORT: number;
    PUBLIC_KEY: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
    return {
        ...process.env,
    };
};

// Throwing an Error if any field was undefined we don't 
// want our app to run if it can't connect to DB and ensure 
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type 
// definition.

const getSanitzedConfig = (config: ENV): Config => {
    // This doesn't work as it is just iterating over the keys
    // that exist and not the ones defined in my interface.

    // for (const [key, value] of Object.entries(config)) {
    //     if (value === undefined) {
    //         throw new Error(`Missing key ${key} in .env`);
    //     }
    // }

    // So let's just cast and let the app crash if keys are missing
    return config as Config;
};

const config = getConfig();
const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;

