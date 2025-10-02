# 🤖 Nox Discord Bot - AI Agent Guidelines

## Architecture Overview

**TypeScript Discord.js v14 bot** with service-oriented architecture and dynamic command loading.

### Core Components
- **`src/index.ts`** - Main entry point with service initialization and graceful shutdown
- **`src/services/bot.ts`** - Discord client wrapper handling interactions and prefix commands
- **`src/services/commandHandler.ts`** - Slash command execution with error handling
- **`src/services/commandRegistrar.ts`** - Discord API command registration (global/dev guild)

### Command System
- **Dual command types**: Slash commands (`/command`) + prefix commands (`!command`)
- **Dynamic loading**: Commands auto-discovered from `src/commands/` directory
- **Unified subcommands**: All features under `/nox` with auto-discovery from `src/commands/subcommands/`
- **Factory pattern**: Commands can export async factory functions for dynamic building

### Key Patterns

#### Command Structure
```typescript
// Option 1: Static command object
export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Test response'),
  execute: async (interaction: ChatInputCommandInteraction) => { /* ... */ }
}

// Option 2: Async factory function
const createCommand = async () => ({
  data: await buildDynamicCommand(),
  execute: async (interaction) => { /* ... */ }
});
export default createCommand;
```

#### Subcommand Pattern (`src/commands/subcommands/`)
```typescript
// weather.ts - auto-discovered and integrated
async function weather(interaction: ChatInputCommandInteraction, params: string) {
  // Implementation
}
export { weather };
```

#### Configuration Loading
```typescript
import configLoader from './utils/configLoader.js';
const config = await configLoader.loadConfig('client'); // loads src/config/client.json
```

#### Logging
```typescript
import Logger from './utils/logger.js';
Logger.info('Starting bot...');     // ℹ️
Logger.success('Loaded commands');  // ✅
Logger.warn('Config missing');      // ⚠️
Logger.error('Failed to start');    // ❌
Logger.debug('Debug info');         // 🔍 (dev mode only)
```

## Development Workflows

### Running the Bot
```bash
npm start      # Development with ts-node/esm
npm run dev    # Watch mode for development
npm run build  # Compile TypeScript to dist/
npm run prod   # Production build + run
```

### Command Registration
```bash
npm run refresh  # Refresh slash commands (uses refresh-commands.ts)
```
- Set `GUILD_ID` in `.env` for instant dev guild updates (avoids global registration delays)
- Commands register globally if no `GUILD_ID` set

### Adding Features

#### New Slash Command
1. Create `src/commands/newcommand.ts`
2. Export command object with `data` (SlashCommandBuilder) and `execute` function
3. Restart bot or run `npm run refresh`

#### New Nox Subcommand
1. Create `src/commands/subcommands/newfeature.ts`
2. Export function matching filename: `export { newfeature };`
3. Add option handling in `src/commands/nox.ts` `buildCommandWithSubcommands()`
4. Restart bot - no code changes needed elsewhere

#### New Prefix Command
1. Add to `src/config/prefix-commands.json`: `{"command": "response"}`
2. Bot auto-loads on restart (file is gitignored for private commands)

## Project Conventions

### ES Modules with TypeScript
- Use `.js` extensions in imports despite `.ts` files (ESM requirement)
- Async imports with `pathToFileURL()` for dynamic loading
- Top-level await supported in command files

### Error Handling
- All interactions wrapped in try/catch with user-friendly error messages
- Graceful shutdown on SIGINT/SIGTERM with `process.on()`
- Uncaught exception/rejection handlers in main

### Configuration
- Environment variables in `.env` (gitignored)
- JSON configs in `src/config/` loaded via `configLoader`
- Client intents configured in `src/config/client.json`

### Auto-Features
- **Prefix command cleanup**: `!` commands auto-delete original message to prevent spam
- **Subcommand auto-discovery**: Drop `.ts` file in `subcommands/` - automatically available
- **Dynamic command building**: `/nox` command rebuilds options from filesystem
- **Development mode**: `GUILD_ID` enables instant command updates

### External Integrations
- **OpenWeatherMap**: Weather API with geocoding fallback
- **Priberam Dictionary**: Portuguese definitions with accent auto-correction
- **Discord.js v14**: Modern API with GatewayIntentBits

## Common Patterns

### Service Initialization Order
```typescript
// src/index.ts pattern
const bot = new Bot(intents);
const commandHandler = new CommandHandler();
await commandHandler.initialize();
const commandRegistrar = new CommandRegistrar(token, clientId, guilds);
bot.setCommandHandler(commandHandler);
await commandRegistrar.registerCommands(commands);
await bot.login(token);
```

### Dynamic Command Loading
```typescript
// From commandLoader.ts - supports both static and factory patterns
let resolvedCommand = commandModule;
if (typeof commandModule === 'function') {
  resolvedCommand = await commandModule();
}
```

### Subcommand Execution
```typescript
// From nox.ts - parameter passing pattern
if (subcommand === 'weather') {
  const location = interaction.options.getString('location');
  await subcommands.weather(interaction, location || '');
}
```

## File Organization
- **`src/commands/`** - Main slash commands (auto-loaded)
- **`src/commands/subcommands/`** - Nox subcommands (auto-discovered)
- **`src/services/`** - Business logic services
- **`src/utils/`** - Shared utilities (logger, config loader, etc.)
- **`src/config/`** - JSON configuration files
- **`.github/copilot-instructions.md`** - This file for AI agent guidance