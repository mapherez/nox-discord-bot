# Nox Discord Bot - AI Agent Instructions

## Architecture Overview

This is a modular Discord.js v14 bot with service-oriented architecture. The bot uses a unified command structure where `/nox` is the main command with dynamically loaded subcommands.

### Key Directories

- **`commands/`** - Main command files (currently only `nox.js`)
- **`commands/subcommands/`** - Individual subcommand modules (auto-loaded)
- **`services/`** - Business logic (Bot, CommandHandler, CommandRegistrar)
- **`utils/`** - Utilities (Logger, ConfigLoader, CommandLoader, EnvironmentValidator)
- **`config/`** - JSON configuration files (client.json, prefix-commands.json)

## Required Discord Intents

For the bot to function properly:

- **Guilds**: Required for slash commands
- **GuildMessages**: Required for message events
- **MessageContent**: Required for ! prefix commands (privileged intent - must be enabled in Discord Developer Portal)

## Command Structure

### Unified /nox Command with Subcommands

All functionality is accessed through `/nox` subcommands. The main `nox.js` dynamically loads subcommands from `commands/subcommands/` and builds Discord subcommands automatically.

```javascript
// commands/subcommands/definition.js
async function definition(interaction, word) {
  // Fetches Portuguese word definitions from Priberam dictionary
  // Auto-corrects Portuguese accents using nspell + dictionary-pt-pt
  // Downloads definition image and uploads as Discord attachment
  // Displays definition image directly in chat
}
module.exports = { definition };

// Automatically becomes: /nox definition [word]
```

### Prefix Commands (! Commands)

Simple prefix-based commands stored in JSON configuration for easy maintenance.

```javascript
// config/prefix-commands.json
{
  "hello": "Hey!",
  "love": "https://myimageservice.com/image1.png"
}

// Automatically responds to !hello, !love, etc.
// Command messages are automatically deleted to prevent spam
```

### Dynamic Subcommand Loading

```javascript
// In nox.js - automatic discovery and loading
const subcommands = {};
fs.readdirSync('./subcommands').forEach(file => {
  const module = require(`./subcommands/${file}`);
  Object.assign(subcommands, module); // Merge all functions
});

// Dynamic command building
function buildCommandWithSubcommands() {
  const command = new SlashCommandBuilder().setName("nox");
  Object.keys(subcommands).forEach(name => {
    command.addSubcommand(/* build subcommand */);
  });
  return command;
}
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
- Commands are defined in JS files with dynamic subcommand building

## Development Workflow

### Starting the Bot

```bash
npm start  # Runs: node index.js
```

### Adding Subcommands

1. Create `commands/subcommands/yourcommand.js`
2. Export function: `async function yourcommand(interaction, params)`
3. Add options in `buildCommandWithSubcommands()` if needed
4. Restart bot - subcommand auto-registers

### Command Registration

- **Development**: Registers only in dev guilds (instant updates, no duplicates)
- **Production**: Registers globally when `GUILD_ID` removed
- Template file renamed to `template.js.example` to prevent accidental loading

## Key Patterns

### Dynamic Subcommand System

```javascript
// Subcommand functions are simple - no Discord builders needed
async function weather(interaction, location) {
  // location comes from Discord subcommand option
  const apiKey = process.env.OPENWEATHER_API_KEY;
  // ... implementation
}
module.exports = { weather };
```

### Service Initialization

```javascript
// Services initialized in index.js main() function
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

### Logging Patterns

- Use Logger utility with emoji prefixes: `Logger.info()`, `Logger.success()`, `Logger.warn()`, `Logger.error()`, `Logger.debug()`
- Debug logs only show in development mode (`NODE_ENV=development`)

### Command Registration

- **Development mode**: Only registers in dev guilds (no global, no duplicates)
- **Production mode**: Registers globally when `GUILD_ID` removed
- Dynamic subcommand building from filesystem
- Template file excluded from loading (renamed to `.example`)

## File Naming Conventions

- **Main Commands**: `commands/commandname.js`
- **Subcommands**: `commands/subcommands/subcommandname.js` (function name matches filename)
- **Services**: `services/ServiceName.js` (PascalCase)
- **Utils**: `utils/utilityName.js` (camelCase)
- **Config**: `config/filename.json`
- **Templates**: `commands/template.js.example` (not loaded)

## Dependencies

- **discord.js v14** - Core bot framework
- **dotenv** - Environment variable loading
- **axios** - HTTP requests (for weather API)

## Common Gotchas

- **Subcommand naming**: Function name must exactly match filename (without .js)
- **Command registration**: Only registers in dev guilds during development to avoid duplicates
- **Template file**: Renamed to `.example` to prevent accidental loading as command
- **Dynamic loading**: Subcommands are discovered at startup - no imports needed
- Use `interaction.reply()` for initial response, `interaction.followUp()` for additional messages
- Embeds use Discord.js embed format, not Discord API format
- All command executions should be async and handle errors gracefully
