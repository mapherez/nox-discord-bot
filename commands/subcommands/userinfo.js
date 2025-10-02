async function userinfo(interaction, userParam) {
  // userParam is now a User object from Discord subcommand, or empty string
  const targetUser = userParam || interaction.user;

  const member = interaction.guild
    ? interaction.guild.members.cache.get(targetUser.id)
    : null;

  const embed = {
    color: 0x0099ff,
    title: `${targetUser.username}'s Information`,
    thumbnail: {
      url: targetUser.displayAvatarURL({ dynamic: true, size: 256 }),
    },
    fields: [
      {
        name: "👤 Username",
        value: targetUser.username,
        inline: true,
      },
      {
        name: "🆔 User ID",
        value: targetUser.id,
        inline: true,
      },
      {
        name: "📅 Account Created",
        value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`,
        inline: false,
      },
    ],
    timestamp: new Date(),
    footer: {
      text: "Nox AI Assistant",
    },
  };

  // Add guild-specific information if in a server
  if (member && interaction.guild) {
    embed.fields.push(
      {
        name: "📥 Joined Server",
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
        inline: false,
      },
      {
        name: "🎭 Roles",
        value:
          member.roles.cache.size > 1
            ? member.roles.cache
                .filter((role) => role.name !== "@everyone")
                .map((role) => role.toString())
                .join(", ")
            : "No roles",
        inline: false,
      }
    );
  }

  await interaction.reply({ embeds: [embed] });
}

module.exports = { userinfo };