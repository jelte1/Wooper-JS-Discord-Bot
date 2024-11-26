const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { getSkillLevelFifty, getSkillLevel, getRuneSkillLevel, getSocialSkillLevel, getDungeonSkillLevel } = require('../utils/skillxp.js');
const { uuidToUsername, usernameToUUID } = require("../utils/uuid");
require('dotenv').config();
const API_KEY = process.env.HYPIXEL_API_KEY;

const GREEN_PANE = '<:green_glass_pane:1102640062006558811>';
const RED_PANE = '<:red_glass_pane:1102640060781830154>';
const SPACING = '\u200b \u200b \u200b \u200b \u200b \u200b \u200b';

/**
 * Generate the "visual" percentage bar for a skill
 * @param percentage
 */
function generatePercentageBar(percentage) {
  const greenCount = Math.floor(percentage / 10);
  const redCount = 10 - greenCount;
  return GREEN_PANE.repeat(greenCount) + RED_PANE.repeat(redCount);
}

module.exports = {
  data: new SlashCommandBuilder()
      .setName('skillstest')
      .setDescription('View Hypixel Skyblock player skills')
      .addStringOption(option =>
          option.setName('username')
              .setDescription('Minecraft username')
              .setRequired(true)
      )
      .addStringOption(option =>
          option.setName('profile')
              .setDescription('Profile name')
      ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const profileName = interaction.options.getString('profile');

    try {
      const userUUID = await usernameToUUID(username);
      const apiUrl = `https://api.hypixel.net/v2/skyblock/profiles?key=${API_KEY}&uuid=${userUUID}`;
      const response = await fetch(apiUrl);
      if (!response.ok) return interaction.reply("Error fetching data");
      const data = await response.json();

      // Find profile
      const profile = profileName
          ? data.profiles.find(p => p.cute_name.toLowerCase() === profileName.toLowerCase())
          : data.profiles.find(p => p.selected);

      if (!profile) {
        return interaction.reply({ content: "Profile not found.", ephemeral: true });
      }

      const player = profile.members[userUUID];
      const level = player.leveling != null ? Math.round(player.leveling.experience / 100).toString() : '0';
      const gamemodeIcon = {
        ironman: '♲',
        bingo: 'Ⓑ',
        stranded: '☀'
      }[profile.game_mode] || '';

      const skillKeys = [
        { name: '<:farming:1102607799231467580> Farming', key: 'SKILL_FARMING', max: 50, handler: getSkillLevel },
        { name: '<:mining:1102608564746461194> Mining', key: 'SKILL_MINING', max: 50, handler: getSkillLevel },
        { name: '<:combat:1102608563135856751> Combat', key: 'SKILL_COMBAT', max: 50, handler: getSkillLevel },
        { name: '<:foraging:1102608560673783889> Foraging', key: 'SKILL_FORAGING', max: 50, handler: getSkillLevelFifty },
        { name: '<:fishing:1102608527979196466> Fishing', key: 'SKILL_FISHING', max: 50, handler: getSkillLevelFifty },
        { name: '<:enchanting:1102608526322438185> Enchanting', key: 'SKILL_ENCHANTING', max: 50, handler: getSkillLevel },
        { name: '<:alchemy:1102608523935891507> Alchemy', key: 'SKILL_ALCHEMY', max: 50, handler: getSkillLevelFifty },
        { name: '<:carpentry:1102608514347716749> Carpentry', key: 'SKILL_CARPENTRY', max: 50, handler: getSkillLevelFifty },
        { name: '<:runecrafting:1102608518449733632> Runecrafting', key: 'SKILL_RUNECRAFTING', max: 25, handler: getRuneSkillLevel },
        { name: '<:social:1102608516444868719> Social', key: 'SKILL_SOCIAL', max: 25, handler: getSocialSkillLevel },
        { name: '<:taming:1102608522480472115> Taming', key: 'SKILL_TAMING', max: 50, handler: getSkillLevelFifty },
        { name: '<:dungeons:1102608519942918295> Dungeons', key: 'SKILL_DUNGEONS', max: 50, handler: getDungeonSkillLevel }
      ];

      const fields = [];
      let skillSum = 0;

      for (const { name, key, max, handler } of skillKeys) {
        const skillXP = key === 'SKILL_DUNGEONS'
            ? player.dungeons.dungeon_types.catacombs.experience ?? 0
            : player.player_data.experience[key] ?? 0;
        // Get skill exp values
        const skill = await handler(skillXP, max);

        // Exclude from skill average
        if (!['SKILL_RUNECRAFTING', 'SKILL_SOCIAL', 'SKILL_DUNGEONS'].includes(key)) {
          skillSum += skill.level;
        }

        const bar = generatePercentageBar(skill.percentToNextLevel);
        const xpDisplay = `${(skillXP - skill.xpForCurrentLevel).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/,/g, '.')} / ${skill.xpNeededForNextLevel.toLocaleString()}`;

        fields.push({
          name: `${name} **${skill.level}**`,
          value: `${SPACING} ${bar} ${skill.percentToNextLevel.toFixed(1)}% ${skill.max} \n ${SPACING} ${xpDisplay}`,
          inline: false
        });
      }
      // Calculate skill average (-3 cuz of excluded)
      const skillAverage = (skillSum / (skillKeys.length - 3)).toFixed(2).replace(/\./g, ',');

      const embed = new EmbedBuilder()
          .setColor('#96C7E1')
          .setTitle(`[${level}] ${await uuidToUsername(userUUID)}'s Skills on ${profile.cute_name} ${gamemodeIcon}`)
          .setThumbnail(`https://mc-heads.net/head/${userUUID}`)
          .setDescription(`Skill Average of **${skillAverage}** \n Excluding Runecrafting, Social and Dungeons.`)
          .addFields(fields);

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: "An error occurred while fetching data.", ephemeral: true });
    }
  }
};
