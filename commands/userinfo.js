const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Shows information about a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get info about (defaults to yourself)")
        .setRequired(false)
    ),

  execute: async (interaction) => {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild
      ? interaction.guild.members.cache.get(user.id)
      : null;

    const embed = {
      color: 0x0099ff,
      title: `${user.username}'s Information`,
      thumbnail: {
        url: user.displayAvatarURL({ dynamic: true, size: 256 }),
      },
      fields: [
        {
          name: "👤 Username",
          value: user.username,
          inline: true,
        },
        {
          name: "🆔 User ID",
          value: user.id,
          inline: true,
        },
        {
          name: "📅 Account Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: false,
        },
      ],
      timestamp: new Date(),
      footer: {
        text: "User Info Command",
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
  },
};
