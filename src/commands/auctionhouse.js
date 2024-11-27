const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const { itemName, hexCode } = require('../utils/nbt.js');
const generateImage = require('../utils/generateImage.js');
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const { uuidToUsername } = require("../utils/uuid");
const { colors } = require('../config/config.js');

let cachedAuctionData;
const cachedImageKeys = new Map();

const RIGHT_BUTTON = '<:Right_button:1307734888723644437>';
const LEFT_BUTTON = '<:Left_button:1307734459734294538>';

class AuctionCommand {
	constructor() {
		this.dataByInvocation = {};
		this.interaction = null;
	}

	async execute(interaction) {
		const invocationId = interaction.id;
		this.dataByInvocation[invocationId] = {
			index: 0,
			embed: null,
			currentIndex: null,
			auctionData: null
		};
		this.interaction = interaction;

		await this.processAuctionData(interaction);
	}

	/**
	 * Processes the auction data and updates the interaction with the results.
	 *
	 * @param {Object} interaction - The interaction object from Discord.
	 */
	async processAuctionData(interaction) {
		const invocationId = interaction.id;
		const data = this.dataByInvocation[invocationId];

		// Get item and enchants from user command
		const item = interaction.options.getString('item');
		const enchantsString = interaction.options.getString('item-modifiers') ?? '';
		const enchants = enchantsString.split(',').map(enchant => enchant.trim());

		// Check for data availability
		if (!cachedAuctionData) {
 			await interaction.editReply({ content: "Hypixel Auction data unavailable." });
			return;
		}

		// Lowercase item and enchants for filtering
		const lowerItem = item.toLowerCase();
		const lowerEnchants = enchants.map(enchant => enchant.toLowerCase());

		const auctionsA = cachedAuctionData.filter(auction => {
			if (!auction.bin) return false;
			if (!auction.item_name.toLowerCase().includes(lowerItem)) return false;
			return lowerEnchants.every(enchant => auction.item_lore.toLowerCase().includes(enchant));
		});

		// Sort by starting bid
		const sortedAuctions = auctionsA.sort((a, b) => a.starting_bid - b.starting_bid);

		const lowestBinAuction = sortedAuctions[0];
		data.index = 0;

		if (!lowestBinAuction) {
			data.embed = new EmbedBuilder()
				.setTitle("Nothing found.")
				.setColor(colors.error);
		} else {
			data.auctionData = sortedAuctions;
			data.currentIndex = 0;
			data.embed = await this.generateEmbed(data.currentIndex, data.auctionData);
		}

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder().setCustomId('previous').setLabel("\u200b").setEmoji(LEFT_BUTTON).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId('next').setLabel("\u200b").setEmoji(RIGHT_BUTTON).setStyle(ButtonStyle.Secondary)
			);

		const interactionMessage = await interaction.editReply({
			components: data.auctionData ? [row] : [],
			embeds: [data.embed],
		});

		if (data.auctionData) {
			try {
				const filter = buttonInteraction => buttonInteraction.user.id === interaction.user.id;
				const collector = interactionMessage.createMessageComponentCollector({filter, time: 300_000});

				collector.on('collect', async buttonInteraction => {
					try {
						if (buttonInteraction.customId === 'previous') {
							data.currentIndex = (data.currentIndex - 1 + data.auctionData.length) % data.auctionData.length;
						} else if (buttonInteraction.customId === 'next') {
							data.currentIndex = (data.currentIndex + 1) % data.auctionData.length;
						}
						data.embed = await this.generateEmbed(data.currentIndex, data.auctionData);
						await interaction.editReply({ components: [row], embeds: [data.embed] });
						buttonInteraction.deferUpdate();
					} catch (e) {
						if (e.code === 10062) {
							console.warn('Interaction has expired or is unknown:', e.message);
						} else {
							console.error('Unexpected error:', e);
						}
					}
				});

				collector.on('end', () => interaction.editReply({components: []})).catch(console.error);
			} catch (e) {
				// wait
			}
		}
	}

	/**
	 * Generates an embed for the auction data.
	 *
	 * @param {number} index - The index of the auction data.
	 * @param {Array} auctionData - The auction data array.
	 * @returns {Promise<Object>} - The generated embed.
	 */
	async generateEmbed(index, auctionData) {
		const auction = auctionData[index];
		const endTime = new Date(auction.end).getTime();
		const unixEndTime = Math.round(endTime / 1000);

		// Get username of auction owner (seller)
		const sellerName = await uuidToUsername(auction.auctioneer);

		// Get decoded item data from auction
		const itemnameA = await itemName(auction.item_bytes);
		let hexcode = await hexCode(auction.item_bytes);
		hexcode = hexcode ? `\n§7Color: #${hexcode}` : '';
		const price = auction.starting_bid;
		// Format price for readability
		const formattedPrice = price.toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 3,
		}).replace(/,/g, '.');
		// Setup item text to generate image from
		const imgBINdata = itemnameA + hexcode + '\n' + auction.item_lore;
		const rarity = auction.tier;
		try {
			// generate image from text
			let image = '';
			const cacheKey = getCachedImageKey(auction.uuid);
			if (cachedImageKeys.has(cacheKey))  {
				image = cachedImageKeys.get(cacheKey);
			} else {
				let imageBuffer = await generateImage(imgBINdata);
				// Create attachment
				const attachment = new AttachmentBuilder(imageBuffer, { name: "image.png" });
				// Get channel to store image in (private unused channel)
				const channelId = process.env.DISCORD_IMAGE_STORAGE_CHANNEL;
				const channel = await this.interaction.client.channels.cache.get(channelId);
				if (!channel) throw new Error("Image storage channel not found.");
				// Send image in "storage channel" to be retrieved from again
				image = await channel.send({ files: [attachment] });
				cachedImageKeys.set(cacheKey, image);
			}

			// Get url of the attachment (image) from the storage channel
			const attachment = image.attachments.first();
			const attachmentUrl = attachment.url;
			// Build embed
			return new EmbedBuilder()
				.setTitle(`Auction: ${auction.item_name}`)
				.setColor(colors[rarity])
				.addFields(
					{name: 'Seller', value: `${sellerName ?? '```Error retrieving user```'}`, inline: true},
					{name: 'BIN', value: `${formattedPrice} coins`, inline: true},
					{name: 'Ends/Ended', value: `<t:${unixEndTime}:R>`, inline: true})
				.setImage(attachmentUrl)
				.setTimestamp()
				.setFooter({
					text: `Auction ${index + 1}/${auctionData.length}`,
					iconURL: 'https://cdn.discordapp.com/attachments/589167775491031053/1207397984023609344/1102877827147239424.png?ex=65df7fff&is=65cd0aff&hm=4be4d0b7e6d0acd51ca3a606c7d4dd9394c1a4e62e3b4419f740a58f72c107d2&'
				});
		} catch (error) {
			console.log('Error generating embed:', error);
			return null;
		}
	}
}

/**
 * Loads auction data from a JSON file.
 */
async function loadAuctionData() {
	try {
		// Retrieve auctionData from json file
		const auctionDataFile = path.join(__dirname, '..', 'resources/json', 'auctionData.json');
		const rawData = fs.readFileSync(auctionDataFile, "utf8");
		// Update the local var
		cachedAuctionData = JSON.parse(rawData);
	} catch (error) {
		console.error("Error loading auction data:", error);
		cachedAuctionData = [];
	}
}

/**
 * Fetches auction data from the Hypixel API and saves it to a file.
 */
async function fetchAuctionData() {
	try {
		const auctionDataFile = path.join(__dirname, '../resources/json', 'auctionData.json');
		const apiUrl = `https://api.hypixel.net/skyblock/auctions`;
		const response = await fetch(apiUrl);
		if (!response.ok) throw new Error("Error fetching data");
		const responseData = await response.json();

		const totalPages = responseData.totalPages;
		let promises = [];

		for (let i = 0; i < totalPages; i++) {
			promises.push(fetch(`${apiUrl}?page=${i}`));
		}

		const responses = await Promise.all(promises);
		const dataArr = await Promise.all(responses.map(res => res.json()));
		const allAuctions = dataArr.flatMap(data => data.auctions);

		fs.writeFileSync(auctionDataFile, JSON.stringify(allAuctions, null, 2), "utf8");
		await loadAuctionData();
	} catch (error) {
		console.error('Error fetching auction data:', error);
	}
}

/**
 * Generates a cache key for the given item lore.
 *
 * @param {string} item_lore - The item lore to generate a cache key for.
 * @returns {string} - The generated cache key.
 */
function getCachedImageKey(item_lore) {
	return crypto.createHash('md5').update(item_lore).digest('hex');
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('auctionhouse')
		.setDescription('Browse the Hypixel Skyblock auction house.')
		.addStringOption(option => option.setName('item').setDescription('Item to find on the Auction House').setMaxLength(2000).setRequired(true))
		.addStringOption(option => option.setName('item-modifiers').setDescription('Modifiers of the item, like the rarity or the enchantments. Separate multiple by comma.').setRequired(false)),

	async execute(interaction) {
		await interaction.deferReply();
		const auctionCommand = new AuctionCommand();
		await auctionCommand.execute(interaction);
	},
	// Function to be called in main to supply auctionData
	loadAuctionData,
	fetchAuctionData
};