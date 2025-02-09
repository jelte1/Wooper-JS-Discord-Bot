const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const generateImage = require('../utils/generateImage.js'); // Ensure correct path

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minecrafttext')
        .setDescription('Generate an image with Minecraft-styled text.')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Enter the Minecraft-styled text (supports color codes like §a)')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply(); // Prevent timeout

        try {
            let inputText = interaction.options.getString('text');

            // Convert \n (Discord input) into actual newlines
            inputText = inputText.replace(/\\n/g, '\n');

            // Generate image buffer from text
            const imageBuffer = generateImage(inputText);

            // Create image attachment
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'mc_text.png' });

            // Reply with the generated image
            await interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error("Error generating Minecraft text image:", error);
            await interaction.editReply({ content: "⚠️ Error generating image.", ephemeral: true });
        }
    }
};
