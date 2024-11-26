const path = require('path');
const { createCanvas, registerFont } = require('canvas');
require('dotenv').config();

/**
 * Array mapping Minecraft color codes with their symbols.
 *
 * @typedef {Object} colorMap
 * @property {string} char - Minecraft color code character.
 * @property {string} color - color in hex format.
 * @property {string} shadow - shadow color in hex format.
 */
var colorMap = [
  { char: "§0", color: "#000000", shadow: "#000000" },
  { char: "§1", color: "#0000AA", shadow: "#00002A" },
  { char: "§2", color: "#00AA00", shadow: "#002A00" },
  { char: "§3", color: "#00AAAA", shadow: "#002A2A" },
  { char: "§4", color: "#AA0000", shadow: "#2A0000" },
  { char: "§5", color: "#AA00AA", shadow: "#2A002A" },
  { char: "§6", color: "#FFAA00", shadow: "#2A2A00" },
  { char: "§7", color: "#AAAAAA", shadow: "#2A2A2A" },
  { char: "§8", color: "#555555", shadow: "#151515" },
  { char: "§9", color: "#5555FF", shadow: "#15153F" },
  { char: "§a", color: "#55FF55", shadow: "#153F15" },
  { char: "§b", color: "#55FFFF", shadow: "#153F3F" },
  { char: "§c", color: "#FF5555", shadow: "#3F1515" },
  { char: "§d", color: "#FF55FF", shadow: "#3F153F" },
  { char: "§e", color: "#FFFF55", shadow: "#3F3F15" },
  { char: "§f", color: "#FFFFFF", shadow: "#3F3F3F" },
  { char: "§l", color: "bold" },
];

// Arbitrary size
const tempCanvas = createCanvas(1, 1);
const tempCtx = tempCanvas.getContext('2d');

// Load Minecraft fonts
const minecraftFont = path.join(__dirname, '..', 'resources/font', 'minecraft.ttf');
const minecraftBoldFont = path.join(__dirname, '..', 'resources/font', 'minecraftbold.ttf');

registerFont(minecraftFont, { family: 'Minecraft' });
registerFont(minecraftBoldFont, { family: 'MinecraftBold' });

/**
 * Generates an image from string of text with Minecraft color codes in Minecraft font.
 *
 * @param {string} item_lore - input text containing Minecraft color codes.
 * @returns {Buffer} - generated image as a buffer in PNG format.
 */
function generateImage(item_lore) {
  // Padding around text
  const padding = 15;
  // Font size for text
  const baseFontSize = 34;
  // Extra space between lines
  const baseLineSpacing = 5;

  const lines = item_lore.split('\n');

  // Temporary canvas for text measurement
  const tempCanvas = createCanvas(1, 1);
  const tempCtx = tempCanvas.getContext('2d');

  let maxTextWidth = 0;

  // Measure text width and height for each line
  lines.forEach((line) => {
    const segments = line.split(/(§[a-zA-Z0-9])/);
    let lineWidth = 0;
    let isBold = false;

    // Measure text width for each line and get the maximum width for the canvas
    segments.forEach((segment) => {
      if (segment.startsWith("§")) {
        const colorEntry = colorMap.find((entry) => entry.char === segment);
        if (colorEntry) {
          isBold = colorEntry.color === "bold";
        }
      } else {
        tempCtx.font = `${baseFontSize}px ${isBold ? "MinecraftBold" : "Minecraft"}`;
        const metrics = tempCtx.measureText(segment);

        // Measure line width
        lineWidth += metrics.width;

      }
    });

    // Update max text width and total height
    maxTextWidth = Math.max(maxTextWidth, lineWidth);
  });

  // Calculate canvas dimensions
  const canvasWidth = Math.ceil(maxTextWidth + padding * 2); // Add horizontal padding
  let totalHeight = lines.length * (baseFontSize + baseLineSpacing)
  // Add vertical padding
  const canvasHeight = Math.ceil(totalHeight + padding * 2);

  // Create canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  // Get canvas context
  const ctx = canvas.getContext('2d');

  // Set background color
  ctx.fillStyle = '#120714FF'; // Black background
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Initial vertical position with padding
  let verticalPos = padding + 30;

  // Render text line by line
  lines.forEach((line) => {
    if (line.trim() === "") {
      // Empty line: move y position
      verticalPos += baseFontSize + baseLineSpacing;
      return;
    }

    // Split line into segments with color codes
    const segments = line.split(/(§[a-zA-Z0-9])/);
    // Initial horizontal position
    let horizontalPos = padding;
    // Default color
    let currentColor = { color: "#FFFFFF", shadow: "#000000" };
    let isBold = false;

    segments.forEach((segment) => {
      if (segment.startsWith("§")) {
        const colorEntry = colorMap.find((entry) => entry.char === segment);
        if (colorEntry) {
          if (colorEntry.color === "bold") {
            isBold = true;
          } else {
            currentColor = colorEntry;
            isBold = false;
          }
        }
      } else if (segment.trim() !== "") {
        ctx.font = `${baseFontSize}px ${isBold ? "MinecraftBold" : "Minecraft"}`;

        // Draw shadow
        ctx.fillStyle = currentColor.shadow;
        ctx.fillText(segment, horizontalPos + 3, verticalPos + 3); // Shadow offset

        // Draw text
        ctx.fillStyle = currentColor.color;
        ctx.fillText(segment, horizontalPos, verticalPos);

        // Move x position for next segment
        horizontalPos += ctx.measureText(segment).width;
      }
    });

    // Move y position for next line
    verticalPos += baseFontSize + baseLineSpacing;
  });

  return canvas.toBuffer('image/png');
}

module.exports = generateImage;