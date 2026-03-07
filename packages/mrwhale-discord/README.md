# `@mrwhale-io/discord`

> Discord integration for Mr. Whale - An all-purpose chat bot loaded with fun commands, games, economy features, and a powerful leveling system.

![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Discord.js](https://img.shields.io/badge/discord.js-14+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-latest-blue.svg)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Bot](#running-the-bot)
- [Dashboard Setup](#dashboard-setup)
- [Available Scripts](#available-scripts)
- [Discord Setup](#discord-setup)
- [Commands](#commands)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

✨ **Core Features**
- 🎮 **50+ Commands** across 6 categories (Fun, Game, Image, Economy, Utility, Level)
- 🏆 **Leveling System** with XP, ranks, and leaderboards
- 🎣 **Fishing Mini-Game** with rare catches and achievements
- 🏪 **Economy System** with virtual currency and shop items
- 🎨 **Image Generation** for avatars, rank cards, and memes
- 🌐 **Web Dashboard** for server configuration and statistics

🤖 **Bot Capabilities**
- Slash commands and traditional prefix commands
- Role-based permission system
- Guild-specific settings and configurations
- Automated moderation features
- Activity tracking and statistics
- Database-driven persistent data storage

## Prerequisites

Before setting up the Discord bot, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Discord Application** with bot token
- **SQLite** (automatically handled)
- **Canvas dependencies** for image generation

### Canvas Dependencies

**Windows:** Usually installed automatically with npm

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

## Installation

1. **Clone the repository** (if not already done):
```bash
git clone https://github.com/mrwhale-io/mrwhale.git
cd mrwhale
```

2. **Install dependencies** from the root:
```bash
npm install
```

3. **Build the packages**:
```bash
npm run build
```

## Configuration

1. **Copy the example configuration**:
```bash
cd packages/mrwhale-discord
cp config.json.example config.json
```

2. **Edit `config.json`** with your settings:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "clientId": "YOUR_DISCORD_APPLICATION_ID",
  "guildId": "YOUR_TEST_SERVER_ID (optional)",
  "clientSecret": "YOUR_DISCORD_CLIENT_SECRET",
  "sessionSecret": "RANDOM_STRING_FOR_SESSIONS",
  "redirectUrl": "http://localhost:53134/authorize/callback",
  "proxyUrl": "http://localhost:5173",
  "port": 53134,
  "prefix": "!",
  "database": "database.sqlite",
  "ownerId": "YOUR_DISCORD_USER_ID",
  "cleverbot": "CLEVERBOT_API_KEY (optional)",
  "youtube": "YOUTUBE_API_KEY (optional)",
  "pastebin": "PASTEBIN_API_KEY (optional)",
  "openWeather": "OPENWEATHER_API_KEY (optional)",
  "discordServer": "YOUR_SUPPORT_SERVER_INVITE"
}
```

### Required Configuration

| Field | Description | Required |
|-------|-------------|----------|
| `token` | Discord bot token from Discord Developer Portal | ✅ |
| `clientId` | Discord application ID | ✅ |
| `clientSecret` | Discord client secret (for dashboard OAuth) | ✅ |
| `sessionSecret` | Random string for session security | ✅ |
| `ownerId` | Your Discord user ID (for owner commands) | ✅ |

### Optional Configuration

| Field | Description | Purpose |
|-------|-------------|---------|
| `guildId` | Test server ID | Deploy commands to specific server during development |
| `cleverbot` | Cleverbot API key | AI chat responses |
| `youtube` | YouTube Data API key | Music and video features |
| `openWeather` | OpenWeather API key | Weather command |
| `pastebin` | Pastebin API key | Code sharing features |

## Running the Bot

### Development Mode
```bash
npm run dev
```
This starts the bot with hot reloading using ts-node.

### Production Mode
```bash
npm start
```
This builds the TypeScript code and runs the compiled JavaScript.

### First Time Setup
1. **Deploy slash commands**:
```bash
npm run deploy-commands
```

2. **Seed database with shop items**:
```bash
npm run seed
```

## Dashboard Setup

The bot includes a web dashboard for server management:

1. **Ensure dashboard is configured** in `config.json`:
   - `clientSecret`: Discord client secret
   - `redirectUrl`: OAuth callback URL
   - `port`: Port for the web server

2. **Set up Discord OAuth**:
   - Go to Discord Developer Portal
   - Add `http://localhost:53134/authorize/callback` as redirect URI
   - Enable OAuth2 scopes: `identify`, `guilds`

3. **Access the dashboard**:
   - Start the bot (`npm run dev` or `npm start`)
   - Navigate to `http://localhost:53134`
   - Authenticate with Discord

### Dashboard Features
- Server statistics and analytics
- Command usage tracking
- Member level leaderboards
- Economy and shop management
- Server configuration settings

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reloading |
| `npm start` | Build and start production server |
| `npm run deploy-commands` | Register slash commands with Discord |
| `npm run seed` | Populate database with default shop items |

## Discord Setup

### Creating a Discord Application

1. **Visit Discord Developer Portal**: https://discord.com/developers/applications
2. **Click "New Application"** and name your bot
3. **Go to "Bot" section**:
   - Click "Add Bot"
   - Copy the bot token (keep this secret!)
   - Enable necessary intents (see below)
4. **Go to "OAuth2 > General"**:
   - Copy the Client ID and Client Secret
   - Add redirect URIs for dashboard

### Required Bot Permissions

The bot needs these permissions in your Discord server:
- `Send Messages`
- `Embed Links`
- `Attach Files`
- `Read Message History`
- `Use Slash Commands`
- `Manage Messages` (for moderation features)
- `Add Reactions`

### Bot Intents

Enable these intents in the Discord Developer Portal:
- `Guilds`
- `Guild Messages`
- `Guild Message Reactions`
- `Guild Members` (for user info commands)
- `Message Content Intent` (for prefix commands)

## Commands

The bot includes 50+ commands across multiple categories:

### 🎮 Fun Commands (12)
`ascii`, `choose`, `chuck`, `coin`, `conch`, `dadjoke`, `define`, `fact`, `gameidea`, `meme`, `roll`, `ship`, `whale`

### 🎲 Game Commands (3)
`guess`, `hangman`, `rockpaper`

### 🎨 Image Commands (19)
`avatar`, `avatarfusion`, `bobross`, `chocolate`, `distort`, `gun`, `invert`, `jpeg`, `pixelate`, `rainbow`, and more

### 💰 Economy Commands (8)
`balance`, `buy`, `daily`, `fish`, `inventory`, `leaderboard`, `shop`, `transfer`

### 🔧 Utility Commands (7)
`help`, `info`, `invite`, `langs`, `ping`, `serverinfo`, `whois`

### 🏆 Level Commands (2)
`rank`, `leaderboard`

For a complete command list, visit: https://www.mrwhale.io/commands

## Development

### Project Structure
```
src/
├── client/           # Bot client and core functionality
├── commands/         # Command implementations
├── dashboard/        # Web dashboard controllers and views
├── database/         # Database models and services
├── types/           # TypeScript type definitions
└── util/            # Helper functions and utilities
```

### Adding New Commands
1. Create command file in appropriate category folder
2. Extend the base `Command` class
3. Implement required methods (`execute`, `permissions`, etc.)
4. Export from category index file

### Database
The bot uses Sequelize ORM with SQLite for data persistence:
- User profiles and statistics
- Economy and inventory data
- Server configurations
- Command usage analytics

### Testing
```bash
npm test
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup
1. Follow the installation steps above
2. Set up your test Discord server
3. Configure `config.json` for development
4. Run `npm run dev` to start developing

## Support

- 🌐 **Website**: https://www.mrwhale.io/
- 💬 **Discord Server**: https://discord.gg/wjBnkR4AUZ
- 🐛 **Issues**: https://github.com/mrwhale-io/mrwhale/issues
- 📚 **Documentation**: https://docs.mrwhale.io/

## License

[MIT](https://tldrlegal.com/license/mit-license) © Thomas Bowen