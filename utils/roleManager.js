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
        title: "🎉 Welcome to the Server!",
        description: `You have been successfully verified and granted the ${role.name} role.`,
        color: 0x00FF00,
        fields: [
          {
            name: "Next Steps",
            value: "Upload your first clip to the server to get started!"
          }
        ],
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