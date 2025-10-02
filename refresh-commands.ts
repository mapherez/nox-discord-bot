import "dotenv/config";
import { createSlashCommands } from "./src/utils/commandLoader.js";
import EnvironmentValidator from "./src/utils/environmentValidator.js";
import Logger from "./src/utils/logger.js";
import CommandRegistrar from "./src/services/commandRegistrar.js";

// Validate environment
EnvironmentValidator.validate();

async function refreshCommands() {
  try {
    Logger.info("🔄 Refreshing Discord slash commands...");

    const commands = await createSlashCommands();
    const developmentGuilds = process.env.GUILD_ID ? [process.env.GUILD_ID] : [];

    const commandRegistrar = new CommandRegistrar(
      process.env.DISCORD_TOKEN!,
      process.env.CLIENT_ID!,
      developmentGuilds
    );

    // Clear existing commands first
    Logger.info("🗑️  Clearing existing commands...");
    await commandRegistrar.unregisterAllCommands();

    // Wait a moment for Discord to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Register new commands
    Logger.info("📝 Registering new commands...");
    await commandRegistrar.registerCommands(commands);

    Logger.success("✅ Commands refreshed successfully!");
    Logger.info("💡 Try using /nox ping in Discord now");

  } catch (error) {
    Logger.error("❌ Failed to refresh commands:", error);
    process.exit(1);
  }
}

refreshCommands();