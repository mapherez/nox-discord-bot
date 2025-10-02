// Template for new slash commands
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandname')  // Replace with your command name
    .setDescription('Command description here'),
    // Add options here if needed:
    // .addStringOption(option =>
    //   option.setName('text')
    //     .setDescription('Enter some text')
    //     .setRequired(true)),

  execute: async (interaction) => {
    // Your command logic here
    await interaction.reply('Hello World!');
  }
};