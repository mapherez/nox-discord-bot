import "dotenv/config";
import {
  createSlashCommands,
  getClientIntents,
} from "./utils/commandLoader.js";
import EnvironmentValidator from "./utils/environmentValidator.js";
import Logger from "./utils/logger.js";
import CommandHandler from "./services/commandHandler.js";
import CommandRegistrar from "./services/commandRegistrar.js";
import Bot from "./services/bot.js";

// Validate environment before starting
EnvironmentValidator.validate();

async function main() {
  try {
    Logger.info("Starting Discord bot...");

    // Load configuration
    const intents = await getClientIntents();
    const commands = await createSlashCommands();
    const developmentGuilds = process.env.GUILD_ID ? [process.env.GUILD_ID] : [];

    // Initialize services
    const bot = new Bot(intents);
    const commandHandler = new CommandHandler();
    await commandHandler.initialize();
    const commandRegistrar = new CommandRegistrar(
      process.env.DISCORD_TOKEN!,
      process.env.CLIENT_ID!,
      developmentGuilds
    );

    // Connect services
    bot.setCommandHandler(commandHandler);

    // Register commands
    await commandRegistrar.registerCommands(commands);

    // Login and start bot
    await bot.login(process.env.DISCORD_TOKEN!);

    Logger.success("Bot started successfully!");

    // Graceful shutdown
    process.on("SIGINT", async () => {
      Logger.info("Received SIGINT, shutting down gracefully...");
      await bot.destroy();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      Logger.info("Received SIGTERM, shutting down gracefully...");
      await bot.destroy();
      process.exit(0);
    });
  } catch (error) {
    Logger.error("Failed to start bot:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  Logger.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

main();
