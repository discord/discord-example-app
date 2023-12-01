// Require the necessary discord.js classes
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on(Events.MessageCreate, message => {
    const messageStr = String(message)
    const hellYeahChannel = message.guild.channels.cache.find(channel => {
        return channel.name === 'hell-yeah'
    })
    switch (true) {
        case messageStr.includes("hell yeah") || messageStr.includes("evil dead"):
            // Short circuit if in hell yeah channel
            if (message.channel?.name === 'hell-yeah') {
                return;
            }

            message?.react('🤘');

            if (!hellYeahChannel) {
                return
            }
            hellYeahChannel?.send('Hell Yeah!')
            break
        case messageStr.includes("banana bread"):
            hellYeahChannel?.send("https://www.youtube.com/embed/9GQyDuz4Fqc?si=l_X4Hcw_1heqyNdT")
            break
        default:
            return
    }

});


// Log in to Discord with your client's token
client.login(token);