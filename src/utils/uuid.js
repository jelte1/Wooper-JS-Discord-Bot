const fetch = require("node-fetch");

/**
 * Fetches the UUID of a Minecraft user based on their username.
 *
 * @param {string} username - The Minecraft username.
 * @returns {Promise<string>} The UUID of the user.
 */
async function usernameToUUID(username) {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    try {
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.log("Unknown username.");
    }
}

/**
 * Fetches the username of a Minecraft user based on their UUID.
 *
 * @param {string} uuid - The UUID of the Minecraft user.
 * @returns {Promise<string>} The username of the user.
 */
async function uuidToUsername(uuid) {
    const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
    try {
        const data = await response.json();
        return data.name;
    } catch (error) {
        console.log("Unknown UUID.");
    }
}

/**
 * Generates a random UUID.
 *
 * @returns {string} A randomly generated UUID.
 */
function generateUUID() {
    // Generate a random hexadecimal string of length 8
    const s4 = () => Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1);
    // Concatenate four random hexadecimal strings separated by hyphens
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

module.exports = {usernameToUUID, uuidToUsername, generateUUID};
