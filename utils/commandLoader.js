const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const Logger = require("./logger");

async function createSlashCommands() {
  try {
    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    const commands = [];

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Support both old format (name/description) and new format (data)
        let slashCommand;
        if (command.data) {
          // New format with SlashCommandBuilder
          slashCommand = command.data;
          Logger.debug(
            `Loaded slash command with options: ${command.data.name}`
          );
        } else if (command.name && command.description) {
          // Old format
          slashCommand = new SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description);
          Logger.debug(`Created slash command: ${command.name}`);
        } else {
          Logger.warn(
            `Command file ${file} is missing required properties (data, name, or description)`
          );
          continue;
        }

        commands.push(slashCommand);
      } catch (error) {
        Logger.error(`Failed to load command file ${file}:`, error);
      }
    }

    Logger.success(`Loaded ${commands.length} slash commands from JS files`);
    return commands;
  } catch (error) {
    Logger.error("Failed to create slash commands:", error);
    throw error;
  }
}

async function getClientIntents() {
  try {
    const configLoader = require("./configLoader");
    const clientConfig = await configLoader.loadConfig("client");

    const { GatewayIntentBits } = require("discord.js");
    const intents = clientConfig.intents
      .map((intentName) => {
        if (GatewayIntentBits[intentName]) {
          return GatewayIntentBits[intentName];
        } else {
          Logger.warn(`Unknown intent: ${intentName}`);
          return null;
        }
      })
      .filter((intent) => intent !== null);

    Logger.success(`Loaded ${intents.length} client intents`);
    return intents;
  } catch (error) {
    Logger.error("Failed to load client intents:", error);
    throw error;
  }
}

module.exports = {
  createSlashCommands,
  getClientIntents,
};
