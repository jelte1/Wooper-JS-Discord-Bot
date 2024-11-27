const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const path = require("path");

const slotSymbols = ['🍒', '🍇', '🍊', '🍒', '🍇', '🍊'];
const currency = 'coins';
let playerData = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Gamble using a slot machine!')
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of money to gamble.').setRequired(true)),

    async execute(interaction) {
        const betAmount = interaction.options.getInteger('amount');

        // Load the player data from the JSON file
        const usersFilePath = path.join(__dirname, '..', 'resources/json', 'playerData.json');
        const usersData = fs.readFileSync(usersFilePath, 'utf8');

        playerData = JSON.parse(usersData);
        // Set the player's coins to 100 if they don't have any coins yet
        const defaultCoins = 100;
        // Get the user's ID
        const userId = interaction.user.id;

        // Get the user's coins
        let coins = playerData[userId] ? playerData[userId].coins : defaultCoins;
        // Check if the player has no coins
        if (coins <= 0) {
            coins = defaultCoins;
            playerData[userId].coins = coins;
            fs.writeFileSync(usersFilePath, JSON.stringify(playerData, null, 2));
        }

        // Check if the bet amount is valid
        if (betAmount <= 0 || betAmount > coins) {
            return interaction.reply({ content: `Please enter a valid bet amount between 1 and ${coins} ${currency}.`, ephemeral: true });
        }

        // Deduct the bet amount from the user's coins
        coins -= betAmount;

        // Save the player data to the JSON file
        playerData[userId].coins = coins;
        fs.writeFileSync(usersFilePath, JSON.stringify(playerData, null, 2));

        let initialMessage;
        let counter = 0;
        let topRow      = '🔹🔸🔹🔸🔹🔸🔹';
        let bottomRow   = '🔸🔹🔸🔹🔸🔹🔸';
        const animateSymbols = async () => {

            const result = [
                slotSymbols[counter % slotSymbols.length],
                slotSymbols[(counter + 1) % slotSymbols.length],
                slotSymbols[(counter + 2) % slotSymbols.length]
            ];

            const updateEmbed = new EmbedBuilder()
                .setTitle('Rolling...')
                .setDescription(topRow + '```' + result.join(' | ') + '```' + bottomRow)
                .setColor('#96C7E1');
            if (counter == 0) {
                initialMessage = await interaction.reply({ embeds: [updateEmbed], fetchReply: true });
            } else {
                await initialMessage.edit({ embeds: [updateEmbed] });
            }

            // Alternating positions of top and bottom rows
            if (counter % 2 === 0) {
                topRow      = '🔸🔹🔸🔹🔸🔹🔸';
                bottomRow   = '🔹🔸🔹🔸🔹🔸🔹';
            } else {
                topRow      = '🔹🔸🔹🔸🔹🔸🔹';
                bottomRow   = '🔸🔹🔸🔹🔸🔹🔸';
            }

            counter++;
        };

        const intervalId = setInterval(animateSymbols, 1000);

        setTimeout(async () => {
            clearInterval(intervalId);

            // Generate the final result
            const result = [];
            for (let i = 0; i < 3; i++) {
                result.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
            }

            // Check for win/loss
            if (result[0] === result[1] && result[1] === result[2]) {
                const wonThis = betAmount * 4;
                coins += wonThis;

                const winEmbed = new EmbedBuilder()
                    .setTitle('You won!')
                    .addFields(
                        { name: 'Rolls', value: '🔸🔹🔸🔹🔸🔹🔸```' + result.join(' | ') + '```🔹🔸🔹🔸🔹🔸🔹', inline: false },
                        { name: 'You won', value: `${wonThis} ${currency}`, inline: false },
                        { name: 'You now have', value: `${coins} ${currency}`, inline: false })
                    // .setDescription('```' + result.join(' | ') + '```')
                    .setColor('#96C7E1');
                
                playerData[userId].coins = coins;
                // Save the player data to the JSON file
                fs.writeFileSync(usersFilePath, JSON.stringify(playerData, null, 2));

                await initialMessage.edit({ embeds: [winEmbed] });
            } else {
                const lossEmbed = new EmbedBuilder()
                    .setTitle('You lost')
                    .addFields(
                        { name: 'Rolls', value: '🔹🔸🔹🔸🔹🔸🔹```' + result.join(' | ') + '```🔸🔹🔸🔹🔸🔹🔸', inline: false },
                        { name: 'You lost', value: `${betAmount} ${currency}`, inline: false },
                        { name: 'You now have', value: `${coins} ${currency}`, inline: false })
                    // .setDescription('```' + result.join(' | ') + '```')
                    .setColor('#96C7E1');
                
                playerData[userId].coins = coins;
                // Save the player data to the JSON file
                fs.writeFileSync(usersFilePath, JSON.stringify(playerData, null, 2));

                await initialMessage.edit({ embeds: [lossEmbed] });
            }
        }, 8000);
    },
};