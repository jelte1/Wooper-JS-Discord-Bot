const zlib = require('zlib');
const nbt = require('nbt');

/**
 * Decode, decompress, and parse NBT data
 *
 * @param {string} content - Base64-encoded string
 * @returns {Promise<object>} - Parsed NBT data
 */
async function parseNBT(content) {
  const decodedData = Buffer.from(content, 'base64');

  // Decompress data
  const decompressed = await new Promise((resolve, reject) => {
    zlib.gunzip(decodedData, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });

  // Parse NBT data
  return new Promise((resolve, reject) => {
    nbt.parse(decompressed, (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });
}

/**
 * Extract item display name from NBT data
 * @param {string} content
 * @returns {Promise<string>}
 */
async function itemName(content) {
  const data = await parseNBT(content);
  return data?.value?.i?.value?.value?.[0]?.tag?.value?.display?.value?.Name?.value || '[none]';
}

/**
 * Extract hex color code from NBT data
 * @param {string} content
 * @returns {Promise<string>}
 */
async function hexCode(content) {
  const data = await parseNBT(content);
  const color = data?.value?.i?.value?.value?.[0]?.tag?.value?.display?.value?.color?.value;
  return color ? decToHex(color) : '';
}

/**
 * Convert decimal to hexadecimal
 * @param {number} decimal
 * @returns {string}
 */
function decToHex(decimal) {
  return decimal.toString(16).toUpperCase();
}

/**
 * Extract armor data from NBT data
 * @param {string} content
 * @returns {Promise<object[]>}
 */
async function armorData(content) {
  const data = await parseNBT(content);
  return data?.value?.i?.value?.value || [];
}

/**
 * Extract equipment data from NBT data
 * @param {string} content
 * @returns {Promise<object[]>}
 */
async function equipmentData(content) {
  const data = await parseNBT(content);
  return data?.value?.i?.value?.value || [];
}

/**
 * Extract inventory data from NBT data
 * @param {string} content
 * @returns {Promise<string>}
 */
async function inventoryData(content) {
  const data = await parseNBT(content);
  const items = data?.value?.i?.value?.value || [];

  return items
      .filter(item => item?.tag?.value?.display?.value?.Name?.value)
      .filter(item => !item.tag.value.display.value.Name.value.includes("§aSkyBlock Menu §7(Click)")) // Exclude specific items
      .map(item => {
        const name = item.tag.value.display.value.Name.value;
        const count = item.Count?.value > 1 ? `\`x${item.Count.value}\`` : '';
        return `\u200b \u200b \u200b \u200b \u200b \u200b \u200b <:fly_down:1234852011745214474> ${name} ${count}`;
      })
      .join('\n');
}

module.exports = {
  itemName,
  hexCode,
  armorData,
  equipmentData,
  inventoryData,
};