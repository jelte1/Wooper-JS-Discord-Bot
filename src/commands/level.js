const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const path = require("path");
const fs = require("fs");

const GREEN_PANE = '<:green_glass_pane:1102640062006558811>';
const RED_PANE = '<:red_glass_pane:1102640060781830154>';
const MAX_LEVEL = 100;

/**
 * Get the required experience to reach the next level
 * @param level
 * @returns {number}
 */
function getRequiredExp(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Generate the "visual" percentage bar for a skill
 * @param percent
 * @returns {string}
 */
function getProgressBar(percent) {
    let greenCount = Math.round(percent / 10);
    let redCount = 10 - greenCount;
    return GREEN_PANE.repeat(greenCount) + RED_PANE.repeat(redCount);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leveltest')
        .setDescription("Check your level and EXP"),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Load the player data from the JSON file
        const usersFilePath = path.join(__dirname, '..', 'resources/json', 'playerData.json');
        const usersData = fs.readFileSync(usersFilePath, 'utf8');

        let playerData = JSON.parse(usersData);

        if (!playerData[userId]) {
            playerData[userId] = { coins: 0, exp: 0, level: 1 }; // Initialize user data if missing
        }

        let { level, exp } = playerData[userId];
        let nextLevelExp = getRequiredExp(level);
        let expPercentage = Math.min((exp / nextLevelExp) * 100, 100); // Ensure it doesn't exceed 100%
        let levelPercentage = Math.min((level / MAX_LEVEL) * 100, 100); // Cap at 100%

        let expBar = getProgressBar(expPercentage);
        let levelBar = getProgressBar(levelPercentage);

        const lvlEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.tag}'s Leveling Status`)
            .addFields(
                { name: 'Level', value: `${level} / ${MAX_LEVEL}\n${levelBar}`, inline: false },
                { name: 'Experience', value: `${exp} / ${nextLevelExp}\n${expBar}`, inline: false }
            )
            .setColor('#96C7E1');

        await interaction.reply({ embeds: [lvlEmbed] });
    }
};
