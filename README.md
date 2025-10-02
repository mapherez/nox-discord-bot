# 🤖 Nox Discord Bot

A modern, modular Discord bot built with Discord.js v14, featuring a clean service-oriented architecture and automatic slash command management.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-blue.svg)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## ✨ Features

### 🚀 Core Commands

- **`/ping`** - Test bot responsiveness with a fun ping-pong reply
- **`/userinfo`** - Display detailed user information with rich embeds
- **`/guildid`** - Get the current server's ID (development utility)

### 🏗️ Architecture Highlights

- **Service-Oriented Design** - Clean separation of concerns with dedicated services
- **Automatic Command Loading** - Commands are discovered and registered automatically
- **Dual Registration** - Instant updates in development guilds + global availability
- **Configuration-Driven** - Flexible configuration through JSON files and environment variables
- **Production-Ready** - Comprehensive error handling and graceful shutdown

## 📁 Project Structure

```text
nox-discord-bot/
├── 📁 commands/          # Slash command implementations
│   ├── ping.js          # Ping command
│   ├── userinfo.js      # User information command
│   ├── guildid.js       # Guild ID utility
│   └── template.js      # Command template
├── 📁 services/          # Business logic services
│   ├── bot.js           # Discord client wrapper
│   ├── commandHandler.js # Command execution manager
│   └── commandRegistrar.js # Command registration service
├── 📁 utils/             # Utility functions
│   ├── commandLoader.js # Command discovery and loading
│   ├── configLoader.js  # Configuration management
│   ├── environmentValidator.js # Environment validation
│   └── logger.js        # Structured logging
├── 📁 config/            # Configuration files
│   └── client.json      # Client settings
├── 📄 index.js           # Main application entry point
├── 📄 package.json       # Dependencies and scripts
└── 📄 .env              # Environment variables (gitignored)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- A Discord application and bot token

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

3. **Configure environment variables**

   Copy the example environment file and fill in your details:

   ```bash
   cp .env.example .env  # If you have an example file
   ```

   Edit `.env` with your bot credentials:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_application_id_here
   GUILD_ID=your_development_guild_id_here  # Optional, for instant command updates
   ```

4. **Start the bot**

   ```bash
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

- `DISCORD_TOKEN` - Your Discord bot token (required)
- `CLIENT_ID` - Your Discord application ID (required)
- `GUILD_ID` - Development guild ID for instant command updates (optional)

### Client Configuration

Edit `config/client.json` to configure Discord intents:

```json
{
  "intents": ["Guilds"]
}
```

## 🛠️ Development

### Adding New Commands

1. **Create a new command file** in the `commands/` directory:

   ```javascript
   const { SlashCommandBuilder } = require('discord.js');

   module.exports = {
     data: new SlashCommandBuilder()
       .setName('yourcommand')
       .setDescription('Command description')
       .addStringOption(option =>
         option.setName('text')
           .setDescription('Some text input')
           .setRequired(false)),

     execute: async (interaction) => {
       const text = interaction.options.getString('text') || 'Hello!';
       await interaction.reply(text);
     }
   };
   ```

2. **Restart the bot** - commands are automatically discovered and registered

### Development Features

- **Instant Command Updates** - Set `GUILD_ID` in `.env` for immediate command registration
- **Hot Reloading** - Command files are cached and reloaded on changes
- **Comprehensive Logging** - Structured logging with different levels
- **Error Handling** - Graceful error handling with user-friendly messages

### Available Scripts

```bash
npm start    # Start the bot
npm test     # Run tests (placeholder)
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
- **Discord.js**: v14.22.1
- **Permissions**: Bot needs appropriate Discord permissions based on commands used

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Discord.js](https://discord.js.org/) - The most popular Discord library for Node.js
- Inspired by modern Discord bot development practices
- Thanks to the Discord developer community

---

## Made with ❤️ for the Discord community

*Have questions or need help? Feel free to open an issue or join our Discord server!*
