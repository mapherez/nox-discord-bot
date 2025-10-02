# 🤖 Nox Discord Bot

A modern, modular Discord bot built with **TypeScript** and Discord.js v14, featuring a unified command system with dynamically loaded subcommands and real-time weather integration.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-blue.svg)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## ✨ Features

### 🚀 Core Commands

- **`/nox`** - AI assistant with dynamically loaded subcommands

#### 🤖 Nox AI Assistant Features

- **Greeting Mode**: `/nox` - Random helpful greetings when no query provided
- **Weather**: `/nox weather [location]` - Real weather data from OpenWeatherMap API
- **Dictionary**: `/nox definition [word]` - Portuguese word definitions from Priberam dictionary (displays definition images directly, auto-corrects accents)
- **Help**: `/nox help` - Interactive help system with all available commands
- **User Info**: `/nox userinfo [@user]` - Get detailed user information
- **Server Info**: `/nox guildid` - Get current server/guild ID
- **Ping Test**: `/nox ping` - Test bot response time
- **Natural Language**: Fallback processing for unrecognized queries

### 💬 Prefix Commands

- **Simple ! Commands** - Quick responses stored in JSON configuration
- **Easy Maintenance** - Add new commands by editing `src/config/prefix-commands.json`
- **Auto-Cleanup** - Bot automatically deletes command messages to prevent channel spam
- **Smart Response** - Clean responses without user mentions or pings
- **Examples**:
  - `!hello` → "Hey!" (command message deleted)
  - `!love` → `https://myimageservice.com/image1.png` (command message deleted)
  - `!test` → "This is a test response!" (command message deleted)

### 🏗️ Architecture Highlights

- **Unified Command System** - All features accessible through `/nox` subcommands
- **Dynamic Subcommand Loading** - Subcommands auto-discovered from filesystem
- **Service-Oriented Design** - Clean separation of concerns with dedicated services
- **Development-First Registration** - Commands register instantly in dev guilds (no duplicates)
- **Modular Architecture** - Easy to extend with new subcommands
- **Production-Ready** - Comprehensive error handling and graceful shutdown

## 📁 Project Structure

```text
nox-discord-bot/
├── 📁 src/
│   ├── 📁 commands/              # Main command implementations
│   │   ├── nox.ts               # Unified AI assistant command
│   │   └── 📁 subcommands/       # Dynamic subcommand modules
│   │       ├── weather.ts       # Weather subcommand
│   │       ├── help.ts          # Help subcommand
│   │       ├── userinfo.ts      # User info subcommand
│   │       ├── guildid.ts       # Guild ID subcommand
│   │       ├── ping.ts          # Ping test subcommand
│   │       ├── definition.ts    # Dictionary subcommand
│   │       ├── naturallanguage.ts # Natural language fallback
│   │       └── template.ts.example  # Command template (renamed to prevent loading)
│   ├── 📁 services/              # Business logic services
│   │   ├── bot.ts               # Discord client wrapper
│   │   ├── commandHandler.ts    # Command execution manager
│   │   └── commandRegistrar.ts  # Command registration service
│   ├── 📁 utils/                 # Utility functions
│   │   ├── commandLoader.ts     # Command discovery and loading
│   │   ├── configLoader.ts      # Configuration management with caching
│   │   ├── environmentValidator.ts # Environment validation
│   │   └── logger.ts            # Structured logging with emojis
│   ├── 📁 config/                # Configuration files
│   │   ├── client.json          # Client settings and intents
│   │   ├── prefix-commands.json # Simple ! command responses
│   │   └── prefix-commands.json.example # Template for prefix commands
│   └── index.ts                 # Main application entry point
├── 📄 refresh-commands.ts       # Command registration utility
├── 📄 package.json              # Dependencies and scripts
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 .env                      # Environment variables (gitignored)
└── 📄 .github/
    └── copilot-instructions.md # AI agent development guidelines
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- A Discord application and bot token
- OpenWeatherMap API key (optional, for weather commands)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nox-discord-bot.git
   cd nox-discord-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Get API keys**

   - **Discord Bot Token**: Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
   - **OpenWeatherMap API Key**: Sign up at [OpenWeatherMap](https://openweathermap.org/api) (free tier available)

4. **Configure environment variables**

   Edit `.env` with your credentials:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_application_id_here
   GUILD_ID=your_development_guild_id_here  # Optional, for instant command updates
   OPENWEATHER_API_KEY=your_weather_api_key_here  # Optional, for weather commands
   ```

5. **Start the bot**

   ```bash
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

- `DISCORD_TOKEN` - Your Discord bot token (required)
- `CLIENT_ID` - Your Discord application ID (required)
- `GUILD_ID` - Development guild ID for instant command updates (optional)
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key for weather commands (optional)

### Client Configuration

Edit `src/config/client.json` to configure Discord intents:

```json
{
  "intents": ["Guilds", "GuildMessages", "MessageContent"]
}
```

**Note**: The `MessageContent` intent is privileged and requires enabling in your [Discord Developer Portal](https://discord.com/developers/applications) under Bot → Privileged Gateway Intents → Message Content Intent.

### OAuth2 Permissions

When generating your bot's invite URL in Discord Developer Portal → OAuth2 → URL Generator, include these permissions:

- **Scopes**: `bot`
- **Bot Permissions**:
  - ✅ Send Messages
  - ✅ Use Slash Commands
  - ✅ Read Message History
  - ✅ Manage Messages (for auto-deleting ! command messages)

**Note**: Server-level permissions may need to be granted in individual channels if they have custom permission overrides.

## 🛠️ Development

### Adding New Subcommands

The bot uses a dynamic subcommand system where all features are accessible through `/nox`. To add a new subcommand:

1. **Create a subcommand file** in `src/commands/subcommands/yourcommand.ts`:

   ```typescript
   import { ChatInputCommandInteraction } from 'discord.js';

   async function yourcommand(interaction: ChatInputCommandInteraction, params: string): Promise<void> {
     // Your subcommand logic here
     // params contains any additional arguments from Discord options
     await interaction.reply('Your command response!');
   }

   export { yourcommand };
   ```

2. **Add options to nox.ts** (if needed) in the `buildCommandWithSubcommands()` function:

   ```typescript
   if (subcommandName === 'yourcommand') {
     command.addSubcommand(subcommand =>
       subcommand
         .setName('yourcommand')
         .setDescription('Description of your command')
         .addStringOption(option =>
           option.setName('param')
             .setDescription('Parameter description')
             .setRequired(false)
         )
     );
   }
   ```

3. **Restart the bot** - subcommands are automatically discovered and registered

### Adding Standalone Commands

For commands that don't fit the `/nox` subcommand pattern:

1. **Create a command file** in the `src/commands/` directory:

   ```typescript
   import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

   export default {
     data: new SlashCommandBuilder()
       .setName('yourcommand')
       .setDescription('Command description'),

     execute: async (interaction: ChatInputCommandInteraction) => {
       await interaction.reply('Hello World!');
     }
   };
   ```

2. **Restart the bot** - commands are automatically discovered

### Adding Prefix Commands

For simple `!` commands that return predefined responses:

1. **Copy the template**:

   ```bash
   cp src/config/prefix-commands.json.example src/config/prefix-commands.json
   ```

2. **Edit `src/config/prefix-commands.json`** with your custom commands:

   ```json
   {
     "hello": "Hey there!",
     "love": "https://myimageservice.com/image1.png",
     "meme": "Check out this funny meme!",
     "yourcommand": "Your custom response here"
   }
   ```

3. **Restart the bot** - prefix commands are automatically loaded

**Note**: Your `prefix-commands.json` file is gitignored to keep your custom commands private.

### Development Features

- **Instant Command Updates** - Set `GUILD_ID` in `.env` for immediate command registration in dev guild only
- **No Duplicate Registration** - Development mode skips global registration to prevent duplicates
- **Dynamic Subcommand Loading** - New subcommands appear automatically without code changes
- **Comprehensive Logging** - Structured logging with emoji prefixes
- **Error Handling** - Graceful error handling with user-friendly messages

### Available Scripts

```bash
npm start      # Start the bot in development mode (with ts-node)
npm run dev    # Start the bot in watch mode for development
npm run build  # Compile TypeScript to JavaScript (outputs to dist/)
npm run prod   # Build and run the production version
npm run refresh # Refresh Discord slash commands
npm test       # Run tests (placeholder)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code structure and naming conventions
- Add appropriate error handling and logging
- Test commands in a development environment before submitting
- Update documentation for new features

## 📋 Requirements

- **Node.js**: 18.0.0 or higher
- **TypeScript**: 5.9.0 or higher
- **Discord.js**: v14.22.1
- **OpenWeatherMap API Key**: For weather commands (optional)
- **Permissions**: Bot needs appropriate Discord permissions based on commands used

## 📦 Dependencies

- **discord.js v14** - Core Discord bot framework
- **TypeScript** - Type-safe JavaScript
- **dotenv** - Environment variable management
- **axios** - HTTP client for API requests (weather data)
- **cheerio** - HTML parsing for web scraping
- **dictionary-pt-pt** - Portuguese dictionary data
- **nspell** - Spell checking library

### Development Dependencies

- **ts-node** - TypeScript execution in Node.js
- **@types/node** - TypeScript definitions for Node.js

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Discord.js](https://discord.js.org/) - The most popular Discord library for Node.js
- Weather data provided by [OpenWeatherMap](https://openweathermap.org/) API
- Inspired by modern Discord bot development practices
- Thanks to the Discord developer community

---

## Made with ❤️ for the Discord community

*Have questions or need help? Feel free to open an issue or join our Discord server!*
