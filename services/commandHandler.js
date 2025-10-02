const fs = require("fs");
const path = require("path");
const Logger = require("../utils/logger");

class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    try {
      const commandsPath = path.join(__dirname, "..", "commands");
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));

      let loadedCount = 0;
      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsPath, file);
          delete require.cache[require.resolve(filePath)]; // Clear cache for hot reloading
          const command = require(filePath);

          // Support both formats: new (data) and old (name/description)
          const commandName = command.data ? command.data.name : command.name;

          if (commandName && command.execute) {
            this.commands.set(commandName, command);
            loadedCount++;
            Logger.debug(`Loaded command: ${commandName}`);
          } else {
            Logger.warn(
              `Command file ${file} is missing required properties (name/data or execute)`
            );
          }
        } catch (error) {
          Logger.error(`Failed to load command file ${file}:`, error);
        }
      }

      Logger.success(`Loaded ${loadedCount} commands`);
    } catch (error) {
      Logger.error("Failed to load commands:", error);
    }
  }

  reloadCommands() {
    Logger.info("Reloading commands...");
    this.commands.clear();
    this.loadCommands();
  }

  async handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands.get(interaction.commandName);

    if (!command) {
      Logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      Logger.debug(`Executing command: ${interaction.commandName}`);
      await command.execute(interaction);
    } catch (error) {
      Logger.error(
        `Error executing command ${interaction.commandName}:`,
        error
      );

      const errorMessage = {
        content: "There was an error while executing this command!",
        ephemeral: true,
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (followUpError) {
        Logger.error("Failed to send error message:", followUpError);
      }
    }
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }
}

module.exports = CommandHandler;
