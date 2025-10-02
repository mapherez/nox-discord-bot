const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Dynamically load all subcommands from the subcommands directory
const subcommands = {};
const subcommandsPath = path.join(__dirname, 'subcommands');

if (fs.existsSync(subcommandsPath)) {
  const subcommandFiles = fs.readdirSync(subcommandsPath).filter(file => file.endsWith('.js'));

  for (const file of subcommandFiles) {
    const subcommand = require(path.join(subcommandsPath, file));
    // Merge all exported functions into the subcommands object
    Object.assign(subcommands, subcommand);
  }
}

// Dynamically build command with subcommands
function buildCommandWithSubcommands() {
  const command = new SlashCommandBuilder()
    .setName("nox")
    .setDescription("AI assistant with various subcommands");

  // Get available subcommands (exclude fallback)
  const availableSubcommands = Object.keys(subcommands).filter(key => key !== 'fallback');

  // Add each subcommand dynamically
  availableSubcommands.forEach(subcommandName => {
    if (subcommandName === 'weather') {
      command.addSubcommand(subcommand =>
        subcommand
          .setName(subcommandName)
          .setDescription(getSubcommandDescription(subcommandName))
          .addStringOption(option =>
            option
              .setName('location')
              .setDescription('City name (defaults to London)')
              .setRequired(false)
          )
      );
    } else if (subcommandName === 'userinfo') {
      command.addSubcommand(subcommand =>
        subcommand
          .setName(subcommandName)
          .setDescription(getSubcommandDescription(subcommandName))
          .addUserOption(option =>
            option
              .setName('user')
              .setDescription('User to get info about (defaults to you)')
              .setRequired(false)
          )
      );
    } else if (subcommandName === 'definition') {
      command.addSubcommand(subcommand =>
        subcommand
          .setName(subcommandName)
          .setDescription(getSubcommandDescription(subcommandName))
          .addStringOption(option =>
            option
              .setName('word')
              .setDescription('Portuguese word to define')
              .setRequired(true)
          )
      );
    } else {
      command.addSubcommand(subcommand =>
        subcommand
          .setName(subcommandName)
          .setDescription(getSubcommandDescription(subcommandName))
      );
    }
  });

  return command;
}

// Helper function to get descriptions for subcommands
function getSubcommandDescription(subcommandName) {
  const descriptions = {
    weather: 'Get current weather information',
    help: 'Show available commands and usage',
    ping: 'Test bot response time',
    userinfo: 'Get information about a user',
    guildid: 'Get the current server/guild ID',
    definition: 'Get Portuguese word definition from Priberam dictionary'
  };
  return descriptions[subcommandName] || `${subcommandName} command`;
}

module.exports = {
  data: buildCommandWithSubcommands(),

  execute: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    try {
      // Handle subcommands with their specific parameters
      if (subcommand === 'weather') {
        const location = interaction.options.getString('location');
        await subcommands.weather(interaction, location || '');
      } else if (subcommand === 'userinfo') {
        const user = interaction.options.getUser('user');
        const username = user ? `<@${user.id}>` : '';
        await subcommands.userinfo(interaction, username);
      } else if (subcommand === 'definition') {
        const word = interaction.options.getString('word');
        await subcommands.definition(interaction, word);
      } else {
        // For subcommands without special parameters, pass empty string
        await subcommands[subcommand](interaction, '');
      }
    } catch (error) {
      console.error("Error in nox command:", error);
      await interaction.reply({
        content: "Sorry, I encountered an error while processing your request.",
        ephemeral: true,
      });
    }
  },
};

// =============================================================================
// SUBCOMMAND MODULES ARE AUTOMATICALLY LOADED FROM commands/subcommands/
// To add a new subcommand:
// 1. Create a new file in commands/subcommands/ (e.g., "newcommand.js")
// 2. Export a function with the same name as the file (e.g., "newcommand")
// 3. That's it! The system automatically discovers and uses your subcommand.
// No code changes needed in nox.js - just drop in the file!
// =============================================================================
