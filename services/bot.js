const { Client } = require("discord.js");
const fs = require("fs");
const path = require("path");
const Logger = require("../utils/logger");

class Bot {
  constructor(intents) {
    this.client = new Client({ intents });
    this.commandHandler = null;
    this.prefixCommands = this.loadPrefixCommands();
    this.setupEventHandlers();
  }

  loadPrefixCommands() {
    try {
      const filePath = path.join(__dirname, "../config/prefix-commands.json");
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      Logger.warn("Could not load prefix commands:", error.message);
      return {};
    }
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

    this.client.on("messageCreate", async (message) => {
      if (message.author.bot) return; // Ignore bot messages

      if (message.content.startsWith("!")) {
        const command = message.content.slice(1).split(" ")[0].toLowerCase();
        const response = this.prefixCommands[command];
        if (response) {
          // Delete the original command message first to prevent spam
          try {
            await message.delete();
          } catch (error) {
            Logger.warn("Could not delete command message:", error.message);
          }

          // Send response as regular message (not reply) since original is deleted
          try {
            await message.channel.send(response);
          } catch (error) {
            Logger.error("Could not send response:", error.message);
          }
        }
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
