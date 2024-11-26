const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require("node-fetch");
const { armorData, equipmentData, inventoryData } = require('../utils/nbt.js');
const { uuidToUsername, usernameToUUID } = require("../utils/uuid");
require('dotenv').config();

const SPACING = '\u200b \u200b \u200b \u200b \u200b \u200b \u200b ';
const API_KEY = process.env.HYPIXEL_API_KEY;

// Helper to clean item display names
const stripString = (str) => str.replace(/§./g, '');

// Helper to process equipment/armor slots
const processSlots = async (slots, dataFn) => {
    if (!slots) {
        return `${SPACING}<:barrier:1103951779772780675> Profile has API visibility disabled`;
    }

    const items = await dataFn(slots.data);
    return items.map(item =>
        item?.tag?.value?.display?.value?.Name?.value
            ? stripString(item.tag.value.display.value.Name.value)
            : '[none]'
    );
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerdatatest')
        .setDescription('View Hypixel Skyblock player data')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username')
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

            if (!response.ok) {
                console.error('Error fetching API:', response.status, response.statusText);
                return interaction.reply({ content: "Error fetching data.", ephemeral: true });
            }

            const data = await response.json();
            const profile = profileName
                ? data.profiles.find(p => p.cute_name.toLowerCase() === profileName.toLowerCase())
                : data.profiles.find(p => p.selected);

            if (!profile) {
                return interaction.reply({ content: "Profile not found.", ephemeral: true });
            }

            const player = profile.members[userUUID];
            const statistics = player.player_stats;
            const level = player.leveling ? Math.round(player.leveling.experience / 100).toString() : '0';

            // Process armor and equipment
            const armorNames = await processSlots(player.inventory.inv_armor, armorData);
            const equipmentNames = await processSlots(player.inventory.equipment_contents, equipmentData);

            // Process inventory
            const inventoryItems = player.inventory.inv_contents
                ? await inventoryData(player.inventory.inv_contents.data)
                : `${SPACING}<:barrier:1103951779772780675> Profile has API visibility disabled`;

            // Get user display name
            const hypixelName = await uuidToUsername(userUUID);

            // Construct embed
            const statsEmbed = new EmbedBuilder()
                .setTitle(`Statistics of [${level}] ${hypixelName} on ${profile.cute_name}`)
                .setThumbnail(`https://mc-heads.net/head/${userUUID}`)
                .setColor("#96C7E1")
                .addFields(
                    { name: "<:clocks:1102930946409386054> First logged in on", value: new Date(player.profile.first_join).toUTCString(), inline: true },
                    { name: "<:bag_of_cash:1102877827147239424> Purse", value: `${(player.currencies.coin_purse ?? 0).toLocaleString()} coins`, inline: true },
                    { name: "<:bank2:1102877809329844235> Bank", value: profile.banking ? `${(profile.banking.balance ?? 0).toLocaleString()} coins` : '0', inline: true },
                    { name: "☠ Highest Critical Hit", value: `${(statistics?.highest_critical_damage ?? 0).toLocaleString()} damage`, inline: true },
                    { name: "<:deaths:1102879337314783274> Deaths", value: `${(statistics?.deaths?.total ?? 0).toLocaleString()}`, inline: true },
                    { name: "<:iron_sword:1102879964308717599> Kills", value: `${(statistics?.kills?.total ?? 0).toLocaleString()}`, inline: true },
                    { name: "<:superior_dragon_helmet:1103994812593610833> Armor", value: armorNames.join('\n'), inline: false },
                    { name: "<:gauntlet:1102891688541814845> Equipment", value: equipmentNames.join('\n'), inline: false },
                    { name: "<:inventory:1102907741825151006> Inventory", value: `${stripString(inventoryItems)}`, inline: false }
                );
            await interaction.reply({ embeds: [statsEmbed] });
        } catch (error) {
            console.error('Error fetching player statistics:', error);
            await interaction.reply({ content: "An error occurred while fetching player statistics.", ephemeral: true });
        }
    },
};