# Nox Discord Bot - AI Agent Instructions

## Architecture Overview

This is a modular Discord.js v14 bot with service-oriented architecture. Commands are automatically loaded from the `commands/` directory and registered globally + in development guilds for instant updates.

### Key Directories

- **`commands/`** - Individual command files (auto-loaded)
- **`services/`** - Business logic (Bot, CommandHandler, CommandRegistrar)
- **`utils/`** - Utilities (Logger, ConfigLoader, CommandLoader, EnvironmentValidator)
- **`config/`** - JSON configuration files

## Command Structure

### Modern Format (Preferred)

```javascript
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("commandname")
    .setDescription("Command description")
    .addStringOption((option) =>
      option
        .setName("param")
        .setDescription("Parameter description")
        .setRequired(false)
    ),

  execute: async (interaction) => {
    // Command logic here
    await interaction.reply("Response");
  },
};
```

### Legacy Format (Supported)

```javascript
module.exports = {
  name: "commandname",
  description: "Command description",
  execute: async (interaction) => {
    await interaction.reply("Response");
  },
};
```

## Environment & Configuration

### Required Environment Variables (`.env`)

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=development_guild_id  # Optional - enables instant command updates
```

### Configuration Files

- **`config/client.json`** - Client intents configuration
- Commands are defined in their respective JS files (no separate JSON)

## Development Workflow

### Starting the Bot

```bash
npm start  # Runs: node index.js
```

### Adding Commands

1. Create `commands/yourcommand.js`
2. Use the template from `commands/template.js`
3. Restart bot - commands auto-register

### Instant Command Updates

- Set `GUILD_ID` in `.env` for immediate command registration in development server
- Commands also register globally (takes ~1 hour)

## Key Patterns

### Service Initialization

```javascript
// Services are initialized in index.js main() function
const bot = new Bot(intents);
const commandHandler = new CommandHandler();
const commandRegistrar = new CommandRegistrar(token, clientId, guilds);

bot.setCommandHandler(commandHandler);
```

### Error Handling

- All async operations wrapped in try-catch
- Logger utility for consistent logging (`Logger.info()`, `Logger.error()`, etc.)
- Graceful shutdown with SIGINT/SIGTERM handlers
- Uncaught exception handling

### Configuration Loading

- `configLoader.js` provides async config loading with caching
- Environment variables take precedence over config files
- `environmentValidator.js` validates required variables on startup

### Command Registration

- Dual registration: development guilds (instant) + global (delayed)
- Automatic command loading from filesystem
- Support for both command formats

## File Naming Conventions

- Commands: `commands/commandname.js`
- Services: `services/ServiceName.js` (PascalCase)
- Utils: `utils/utilityName.js` (camelCase)
- Config: `config/filename.json`

## Dependencies

- **discord.js v14** - Core bot framework
- **dotenv** - Environment variable loading

## Common Gotchas

- Commands require `GUILD_ID` in `.env` for instant updates during development
- Use `interaction.reply()` for initial response, `interaction.followUp()` for additional messages
- Embeds use Discord.js embed format, not Discord API format
- All command executions should be async and handle errors gracefully
