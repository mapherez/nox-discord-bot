const { Client } = require("discord.js");
const Logger = require("../utils/logger");

class Bot {
  constructor(intents) {
    this.client = new Client({ intents });
    this.commandHandler = null;
    this.setupEventHandlers();
  }

  setCommandHandler(commandHandler) {
    this.commandHandler = commandHandler;
  }

  setupEventHandlers() {
    this.client.once("clientReady", () => {
      Logger.success(`Bot online as ${this.client.user.tag}`);
    });

    this.client.on("interactionCreate", async (interaction) => {
      if (this.commandHandler) {
        await this.commandHandler.handleInteraction(interaction);
      }
    });

    this.client.on("error", (error) => {
      Logger.error("Client error:", error);
    });

    this.client.on("warn", (warning) => {
      Logger.warn("Client warning:", warning);
    });
  }

  async login(token) {
    try {
      await this.client.login(token);
      return true;
    } catch (error) {
      Logger.error("Failed to login:", error);
      throw error;
    }
  }

  async destroy() {
    if (this.client) {
      Logger.info("Shutting down bot...");
      await this.client.destroy();
      Logger.success("Bot shut down successfully");
    }
  }
}

module.exports = Bot;
