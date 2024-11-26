const fs = require("fs");
const path = require("path");
const { Routes } = require('discord.js');
const { ActivityType } = require('discord.js');

/**
 * Loads commands from the commands directory and adds them to the client.
 * @param {Client} client - The Discord client.
 */
function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    commandFiles.forEach(file => {
        const command = require(path.join(commandsPath, file));
        if (command?.data && command?.execute) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] Command "${file}" is missing required "data" or "execute" properties.`);
        }
    });
}

/**
 * Registers slash commands with the Discord API.
 * @param {REST} rest - The REST client.
 * @param {Collection} commands - The collection of commands.
 */
async function registerCommands(rest, commands) {
    const commandData = commands.map(command => command.data.toJSON());
    console.log(`Refreshing ${commandData.length} application (/) commands...`);
    const data = await rest.put(
        Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
        { body: commandData }
    );
    console.log(`Successfully registered ${data.length} commands.`);
}

/**
 * Updates the bot's status with the current uptime.
 * @param {Client} client - The Discord client.
 * @param {number} startTime - The start time in milliseconds.
 * @param {Object} uptimeData - The uptime data object.
 * @param {string} uptimeFilePath - The path to the uptime file.
 */
function updateStatus(client, startTime, uptimeData, uptimeFilePath) {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    if (elapsedSeconds !== uptimeData.totalSeconds) {
        uptimeData.totalSeconds = elapsedSeconds;
        fs.writeFileSync(uptimeFilePath, JSON.stringify(uptimeData), "utf8");

        const days = Math.floor(elapsedSeconds / 86400);
        const hours = Math.floor((elapsedSeconds % 86400) / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);

        const status = `for ${days}d ${hours}h ${minutes}m`;
        client.user.setPresence({
            activities: [{ name: status, type: ActivityType.Watching }],
            status: 'online',
        });
    }
}

module.exports = { loadCommands, registerCommands, updateStatus };
