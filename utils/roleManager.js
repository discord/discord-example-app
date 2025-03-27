import client from './discordClient.js';

async function addRole(userId, guildId, roleName) {
  try {
    // Ensure client is ready
    if (!client.isReady()) {
      throw new Error('Discord client is not ready');
    }
    
    // Get the guild
    const guild = await client.guilds.fetch(guildId);
    
    // Find the "Member" role
    const role = guild.roles.cache.find(role => role.name === roleName);

    if (!role) {
      throw new Error(`${roleName} role not found in the guild`);
    }

    // Get the member
    const member = await guild.members.fetch(userId);

    // Add the role
    await member.roles.add(role.id);
    
    // Send a styled direct message
    member.send({
      embeds: [{
        title: `✨ Welcome to ${guild.name}! ✨`,
        description: `Hey ${member.user.username}, we're thrilled to have you join our community! You've been granted the **${role.name}** role.`,
        color: 0x7289DA, // Discord's signature blurple color
        fields: [
          {
            name: "🎯 Your Next Steps",
            value: "Get started by linking your first clipping account! Head to the <#command-center> channel and use `/add-account`. Once linked, you'll be all set to upload and track your clips!"
          },
          {
            name: "💫 Quick Tip",
            value: "Check out our <#command-guide> channel for a comprehensive overview of all available commands and features you can use in the <#command-center>!"
          }
        ],
        footer: {
          text: `Welcome to ${guild.name}! We're glad you're here.`,
          icon_url: member.user.displayAvatarURL()
        },
        thumbnail: {
          url: guild.iconURL() || member.user.displayAvatarURL()
        },
        timestamp: new Date().toISOString()
      }]
    })
    .then(message => console.log(`Sent welcome message to ${member.user.tag}`))
    .catch(console.error);

    console.log(`Added role ${roleName} to user ${userId} in guild ${guildId}`);
    return true;
  } catch (error) {
    console.error('Failed to add role:', error);
    return false;
  }
}

export default addRole; 