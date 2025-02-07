const { Client, Collection, Events, GatewayIntentBits, REST } = require('discord.js');
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: "../.env" });

const { fetchAuctionData, loadAuctionData } = require('./commands/auctionhouse.js');
const { loadCommands, registerCommands, deleteGuildCommands, updateStatus} = require('./utils/utils');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();
loadCommands(client);

const rest = new REST().setToken(process.env.DISCORD_LOGIN_KEY);

/**
 * Register commands on startup
 */
(async () => {
  try {
    await registerCommands(rest, client.commands);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

/**
 * Listen for commands and interactions
 */
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isCommand()) {
    let author = interaction.user;
    // await updateExp(interaction.message, author, interaction.channel);
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error executing this command!', ephemeral: true });
    }
  } else if (interaction.isAutocomplete()) {
    // Handle Autocomplete
    const command = client.commands.get(interaction.commandName);
    if (command && command.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    }
  }
});

const uptimeFilePath = path.join(__dirname, 'resources/json', 'uptime.json');
let uptimeData = fs.existsSync(uptimeFilePath)
    ? JSON.parse(fs.readFileSync(uptimeFilePath, "utf8"))
    : { totalSeconds: 0 };

let startTime;

/**
 * Update status every minute
 */
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  startTime = Date.now() - uptimeData.totalSeconds * 1000;

  await loadAuctionData();
  setInterval(() => updateStatus(client, startTime, uptimeData, uptimeFilePath), 60_000);
  setInterval(() => fetchAuctionData(), 300_000);
});

// Load player data
const playerDataPath = path.join(__dirname, 'resources/json', 'playerData.json');
let playerData = fs.existsSync(playerDataPath)
    ? JSON.parse(fs.readFileSync(playerDataPath, "utf8"))
    : {};

/**
 * Save player data to file
 */
function savePlayerData() {
  fs.writeFileSync(playerDataPath, JSON.stringify(playerData, null, 2), "utf8");
}

/**
 * Update user EXP on message
 */
client.on(Events.MessageCreate, async message => {
    let author = message.author;

    await updateExp(message, author, message.channel);
});

/**
 * Get required EXP for next level
 * @param level
 * @returns {number} Required EXP
 */
function getRequiredExp(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Update user EXP and check for level up
 * @param message
 * @param author
 * @returns {Promise<void>}
 */
async function updateExp(message, author, channel) {
  if (author.bot) return; // Ignore bot messages

  const userId = author.id;
  if (!playerData[userId]) {
    playerData[userId] = { coins: 0, exp: 0, level: 1 }; // Initialize user data if it doesn't exist
  }

  // 10 exp per msg
  playerData[userId].exp += 10;

  let currentLevel = playerData[userId].level;

  // Level up check
  while (playerData[userId].exp >= getRequiredExp(currentLevel)) {
    currentLevel++;
  }

  if (currentLevel > playerData[userId].level) {
    playerData[userId].level = currentLevel;
    await channel.send(`🎉 Congratulations ${author}, you leveled up to **Level ${currentLevel}**!`);
  }

  savePlayerData();
}

/**
 * Save uptime data to file on exit
 */
process.on("exit", () => {
  fs.writeFileSync(uptimeFilePath, JSON.stringify(uptimeData), "utf8");
});

client.login(process.env.DISCORD_LOGIN_KEY);