import { CommandInteraction } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import Logger from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class CommandHandler {
  commands: Map<string, any>;

  constructor() {
    this.commands = new Map();
  }

  async initialize() {
    await this.loadCommands();
  }

  async loadCommands() {
    try {
      const commandsPath = path.join(__dirname, "..", "commands");
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));

      let loadedCount = 0;
      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsPath, file);
          const fileUrl = pathToFileURL(filePath).href;
          const commandModule = await import(fileUrl);

          // Support both default exports and named exports
          let command = commandModule;
          if (commandModule.default) {
            command = commandModule.default;
          }

          // Handle async command factories (functions that return command objects)
          let resolvedCommand = command;
          if (typeof command === 'function') {
            resolvedCommand = await command();
          }

          // Support both formats: new (data) and old (name/description)
          const commandName = resolvedCommand.data ? resolvedCommand.data.name : resolvedCommand.name;

          if (commandName && resolvedCommand.execute) {
            this.commands.set(commandName, resolvedCommand);
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

  async reloadCommands() {
    Logger.info("Reloading commands...");
    this.commands.clear();
    await this.loadCommands();
  }

  async handleInteraction(interaction: CommandInteraction) {
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

  getCommand(name: string) {
    return this.commands.get(name);
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }
}

export default CommandHandler;
