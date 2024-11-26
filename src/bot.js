const { Client, Collection, Events, GatewayIntentBits, REST, ActivityType } = require('discord.js');
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const { fetchAuctionData, loadAuctionData } = require('./commands/auctionhouse.js');
const { loadCommands, registerCommands, updateStatus} = require('./utils/utils');

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

(async () => {
  try {
    await registerCommands(rest, client.commands);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command found for ${interaction.commandName}.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const replyMethod = interaction.replied || interaction.deferred ? 'followUp' : 'reply';
    await interaction[replyMethod]({ content: 'An error occurred while executing this command.', ephemeral: true });
  }
});

const uptimeFilePath = path.join(__dirname, 'resources/json', 'uptime.json');
let uptimeData = fs.existsSync(uptimeFilePath)
    ? JSON.parse(fs.readFileSync(uptimeFilePath, "utf8"))
    : { totalSeconds: 0 };

let startTime;

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  startTime = Date.now() - uptimeData.totalSeconds * 1000;

  await loadAuctionData();
  setInterval(() => updateStatus(client, startTime, uptimeData, uptimeFilePath), 60_000);
  setInterval(() => fetchAuctionData(), 300_000);
});

process.on("exit", () => {
  fs.writeFileSync(uptimeFilePath, JSON.stringify(uptimeData), "utf8");
});

client.login(process.env.DISCORD_LOGIN_KEY);