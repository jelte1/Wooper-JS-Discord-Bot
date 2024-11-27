const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const QRCode = require('qrcode');
const { join } = require('path');
const { writeFile } = require('fs').promises;
const { generateUUID } = require("../utils/uuid");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('qrcode')
		.setDescription('Generates a QR code from URL')
		.addStringOption(option => option.setName('url').setDescription('URL').setRequired(true))
		.addStringOption(option =>
			option.setName('color')
				.setDescription('Specify color of the QR code')
				.addChoices({ name: 'White', value: '#efefef' },
					{ name: 'Gray', value: '#262626' },
					{ name: 'Black', value: '#191919' },
					{ name: 'Red', value: '#db2a1a' },
					{ name: 'Green', value: '#36c120' },
					{ name: 'Orange', value: '#ed8c31' },
					{ name: 'Blue', value: '#3131ed' },
					{ name: 'Yellow', value: '#dbe520' },
					{ name: 'Pink', value: '#ed31be' },
					{ name: 'Purple', value: '#8f31ed' },
					{ name: 'Transparent', value: '#1C00ff00' }))
		.addStringOption(option =>
			option.setName('background-color')
				.setDescription('Specify color of the background')
				.addChoices({ name: 'White', value: '#efefef' },
					{ name: 'Gray', value: '#262626' },
					{ name: 'Black', value: '#191919' },
					{ name: 'Red', value: '#db2a1a' },
					{ name: 'Green', value: '#36c120' },
					{ name: 'Orange', value: '#ed8c31' },
					{ name: 'Blue', value: '#3131ed' },
					{ name: 'Yellow', value: '#dbe520' },
					{ name: 'Pink', value: '#ed31be' },
					{ name: 'Purple', value: '#8f31ed' },
					{ name: 'Transparent', value: '#00000000' }))
		.addIntegerOption(option =>
			option.setName('size')
				.setDescription('Specify the size of the QR code (in pixels)')
				.setMaxValue(10_000)
				.setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply();
		const url = interaction.options.getString('url');
		const color = interaction.options.getString('color') || '#efefef';
		const backgroundcolor = interaction.options.getString('background-color') || '#262626';
		const size = interaction.options.getInteger('size') || 300;
		const username = interaction.user.username;

		try {
			const qrOptions = {
				color: {
					// Color of the QR code itself
					dark: color,
					// Color of the background
					light: backgroundcolor
				},
				width: size
			};
			// Generate QR code and save it to a file
			const filePath = join(__dirname, '..', '/resources/qrcodes', `qrcode-${username}-${generateUUID()}.png`);
			await writeFile(filePath, await QRCode.toBuffer(url, qrOptions));

			// Send the file as a reply
			const file = new AttachmentBuilder(filePath);
			await interaction.followUp({ content: 'QR code:', files: [file] });

		} catch (error) {
			console.error('Error generating QR code:', error);
			await interaction.followUp({ content: 'Error generating the QR code.', ephemeral: true });
		}
	},
};