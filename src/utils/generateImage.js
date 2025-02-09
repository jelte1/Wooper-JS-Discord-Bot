const path = require('path');
const { createCanvas, registerFont } = require('canvas');
require('dotenv').config({ path: "../.env" });

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
  { char: "§k", color: "none" },
];

// Convert colorMap to a Map for faster lookups
const colorLookup = new Map(colorMap.map(entry => [entry.char, entry]));

// Load Minecraft fonts
const minecraftFont = path.join(__dirname, '..', 'resources/font', 'MinecraftStandard.otf');
const minecraftBoldFont = path.join(__dirname, '..', 'resources/font', 'MinecraftStandardBold.otf');

registerFont(minecraftFont, { family: 'Minecraft' });
registerFont(minecraftBoldFont, { family: 'MinecraftBold' });

// Constants
const PADDING = 20;
const BASE_FONT_SIZE = 34;
const BASE_LINE_SPACING = 20;
const SHADOW_OFFSET = 4;

/**
 * Generates an image from a string of text with Minecraft color codes in Minecraft font.
 *
 * @param {string} item_lore - Input text containing Minecraft color codes.
 * @returns {Buffer} - Generated image as a buffer in PNG format.
 */
function generateImage(item_lore) {
  const lines = item_lore.split('\n');

  // Temporary canvas for text measurement
  const tempCanvas = createCanvas(1, 1);
  const tempCtx = tempCanvas.getContext('2d');

  // Measure maximum text width and total height
  let maxTextWidth = 0;
  lines.forEach((line) => {
    const lineWidth = measureLineWidth(tempCtx, line);
    maxTextWidth = Math.max(maxTextWidth, lineWidth);
  });

  const canvasWidth = Math.ceil(maxTextWidth + PADDING * 2);
  const totalHeight = lines.length * (BASE_FONT_SIZE + BASE_LINE_SPACING);
  const canvasHeight = Math.ceil(totalHeight + PADDING * 2);

  // Create canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Set background color
  ctx.fillStyle = '#120714FF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Render text line by line
  let verticalPos = PADDING + 45;
  lines.forEach((line) => {
    if (line.trim() !== "") {
      renderLine(ctx, line, PADDING, verticalPos);
    }
    verticalPos += BASE_FONT_SIZE + BASE_LINE_SPACING;
  });

  return canvas.toBuffer('image/png');
}

/**
 * Measures the width of a line of text, considering Minecraft color codes.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context.
 * @param {string} line - The line of text to measure.
 * @returns {number} - The width of the line.
 */
function measureLineWidth(ctx, line) {
  const segments = line.split(/(§[a-zA-Z0-9])/);
  let lineWidth = 0;
  let isBold = false;

  segments.forEach((segment) => {
    if (segment.startsWith("§")) {
      const colorEntry = colorLookup.get(segment);
      if (colorEntry) {
        isBold = colorEntry.color === "bold";
      }
    } else {
      ctx.font = `${BASE_FONT_SIZE}px ${isBold ? "MinecraftBold" : "Minecraft"}, sans-serif`;
      lineWidth += ctx.measureText(segment).width;
    }
  });

  return lineWidth;
}

/**
 * Renders a line of text onto the canvas, applying Minecraft color codes.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context.
 * @param {string} line - The line of text to render.
 * @param {number} x - The starting x position.
 * @param {number} y - The starting y position.
 */
function renderLine(ctx, line, x, y) {
  const segments = line.split(/(§[a-zA-Z0-9])/);
  let currentX = x;
  let currentColor = colorLookup.get("§f");
  let isBold = false;
  let isEmpty = false;

  segments.forEach((segment) => {
    if (segment.startsWith("§")) {
      const colorEntry = colorLookup.get(segment);
      if (colorEntry) {
        if (colorEntry.color === "bold") {
          isBold = true;
        } else if (colorEntry.color === "none") {
          isEmpty = true;
        } else {
          currentColor = colorEntry;
          isBold = false;
          isEmpty = false;
        }
      }
    } else if (segment.trim() !== "" && !isEmpty) {
      ctx.font = `${BASE_FONT_SIZE}px ${isBold ? "MinecraftBold" : "Minecraft"}, sans-serif`;

      // Draw shadow
      ctx.fillStyle = currentColor.shadow;
      ctx.fillText(segment, currentX + SHADOW_OFFSET, y + SHADOW_OFFSET);

      // Draw text
      ctx.fillStyle = currentColor.color;
      ctx.fillText(segment, currentX, y);

      // Update x position
      currentX += ctx.measureText(segment).width;
    }
  });
}

module.exports = generateImage;