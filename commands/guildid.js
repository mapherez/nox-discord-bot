const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guildid")
    .setDescription("Shows the current guild/server ID"),

  execute: async (interaction) => {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server!",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `🏠 **Guild ID:** \`${interaction.guild.id}\`\n\nAdd this to your \`config/client.json\` under \`developmentGuilds\` for instant command updates!`,
      ephemeral: true,
    });
  },
};
