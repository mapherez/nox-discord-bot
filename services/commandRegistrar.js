const { REST, Routes } = require("discord.js");
const Logger = require("../utils/logger");

class CommandRegistrar {
  constructor(token, clientId, developmentGuilds = []) {
    this.rest = new REST({ version: "10" }).setToken(token);
    this.clientId = clientId;
    this.developmentGuilds = developmentGuilds;
  }

  async registerCommands(commands) {
    try {
      Logger.info("Started refreshing application (/) commands.");

      // Register commands in development guilds for instant updates (if configured)
      if (this.developmentGuilds && this.developmentGuilds.length > 0) {
        Logger.info(`Registering commands in ${this.developmentGuilds.length} development guild(s) for instant updates...`);

        for (const guildId of this.developmentGuilds) {
          await this.rest.put(
            Routes.applicationGuildCommands(this.clientId, guildId),
            { body: commands }
          );
          Logger.success(`Commands registered in guild: ${guildId}`);
        }

        Logger.info("Skipping global registration during development (commands available instantly in dev guilds)");
        return; // Skip global registration when using dev guilds
      }

      // Register globally (when not using development guilds)
      Logger.info("Registering commands globally...");
      await this.rest.put(Routes.applicationCommands(this.clientId), {
        body: commands,
      });

      Logger.success("Successfully reloaded application (/) commands.");
    } catch (error) {
      Logger.error("Failed to register commands:", error);
      throw error;
    }
  }

  async unregisterAllCommands() {
    try {
      Logger.info("Unregistering all application commands.");

      await this.rest.put(Routes.applicationCommands(this.clientId), {
        body: [],
      });

      Logger.success("Successfully unregistered all commands.");
    } catch (error) {
      Logger.error("Failed to unregister commands:", error);
      throw error;
    }
  }
}

module.exports = CommandRegistrar;
