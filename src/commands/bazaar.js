const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bazaartest')
        .setDescription('Check the current Hypixel Skyblock Bazaar price of an item.')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Item name (e.g., Enchanted Diamond, Booster Cookie)')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction) {
        await interaction.deferReply(); // Defer reply to prevent timeout

        const itemName = interaction.options.getString('item').toLowerCase();

        try {
            // Fetch Bazaar data
            const response = await fetch(`https://api.hypixel.net/skyblock/bazaar`);
            if (!response.ok) throw new Error("Failed to fetch Bazaar data.");

            const data = await response.json();
            const bazaarItems = data.products;

            // Find matching item
            const matchedKey = Object.keys(data.products).find(key =>
                key.replace(/_/g, " ").toLowerCase() === itemName
            );

            if (!matchedKey) {
                return interaction.editReply({ content: "❌ Item not found in the Bazaar.", ephemeral: true });
            }

            let cleanedName = matchedKey.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

            const itemData = bazaarItems[matchedKey].quick_status;
            const sellPrice = bazaarItems[matchedKey].sell_summary[0].pricePerUnit.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
            });
            const buyPrice = bazaarItems[matchedKey].buy_summary[0].pricePerUnit.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
            });
            // Format response
            const embed = new EmbedBuilder()
                .setTitle(`Bazaar: ${cleanedName}`)
                .setColor('#FFA500')
                .addFields(
                    { name: '<:Gold_Horse_Armor:1337399454088822834> Buy Price', value: `${buyPrice} coins`, inline: true },
                    { name: '<:Hopper:1337399594031513652> Sell Price', value: `${sellPrice} coins`, inline: true },
                    { name: '<:Map:1337402702849773678> Buy Orders', value: `${itemData.buyOrders.toLocaleString()}`, inline: false },
                    { name: '<:Paper:1337402539825696849> Sell Orders', value: `${itemData.sellOrders.toLocaleString()}`, inline: true },
                    { name: '📊 Volume (Last 24h)', value: `${itemData.sellMovingWeek.toLocaleString()} sold`, inline: false }
                )
                .setFooter({ text: `${cleanedName}`, iconURL: `https://static.wikia.nocookie.net/hypixel-skyblock/images/0/0f/Bazaar_Head.png/revision/latest?cb=20221004085112` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "⚠️ Error fetching Bazaar data. Try again later!", ephemeral: true });
        }
    },

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase().replace(/ /g, "_");

        try {
            // Fetch Bazaar items
            const response = await fetch(`https://api.hypixel.net/skyblock/bazaar`);
            if (!response.ok) throw new Error("Failed to fetch Bazaar data.");
            const data = await response.json();

            // Get item names (raw, for proper filtering)
            const itemNames = Object.keys(data.products);

            // Filter based on user input (converted spaces to underscores)
            const filtered = itemNames
                .filter(item => item.toLowerCase().includes(focusedValue)) // Case-insensitive filtering
                .slice(0, 5);

            // Format results before sending them
            const formattedResults = filtered.map(choice => ({
                // Format name for display, removing underscores and capitalized words
                name: choice.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
                value: choice
            }));

            await interaction.respond(formattedResults);
        } catch (error) {
            console.error("Autocomplete Error:", error);
            await interaction.respond([]);
        }
    }


};
