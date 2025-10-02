async function help(interaction) {
  const helpEmbed = {
    color: 0x0099ff,
    title: "🤖 Nox AI Assistant - Help",
    description: "I can help you with various tasks! Here are some examples:",
    fields: [
      {
        name: "Weather Information",
        value:
          "`/nox weather` - Current weather\n`/nox weather Lisbon` - Weather for a city",
        inline: false,
      },
      {
        name: "User Information",
        value: "`/nox userinfo @username` - Get user info",
        inline: false,
      },
      {
        name: "Server Information",
        value: "`/nox guildid` - Get server/guild ID",
        inline: false,
      },
      {
        name: "Quick Commands",
        value: "`/nox ping` - Test response time\n`/nox help` - Show this help",
        inline: false,
      },
      {
        name: "Natural Language",
        value: "You can also ask me things in natural language!",
        inline: false,
      },
    ],
    footer: {
      text: "Nox AI Assistant",
    },
  };

  await interaction.reply({ embeds: [helpEmbed] });
}

module.exports = { help };