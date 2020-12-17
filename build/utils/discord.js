"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscordImage = void 0;
var discordBadges;
(function (discordBadges) {
    discordBadges[discordBadges["None"] = 0] = "None";
    discordBadges[discordBadges["Discord Employee"] = 1] = "Discord Employee";
    discordBadges[discordBadges["Partnered Server Owner"] = 2] = "Partnered Server Owner";
    discordBadges[discordBadges["HypeSquad Events"] = 4] = "HypeSquad Events";
    discordBadges[discordBadges["Bug Hunter Level 1"] = 8] = "Bug Hunter Level 1";
    discordBadges[discordBadges["House Bravery"] = 64] = "House Bravery";
    discordBadges[discordBadges["House Brilliance"] = 128] = "House Brilliance";
    discordBadges[discordBadges["House Balance"] = 256] = "House Balance";
    discordBadges[discordBadges["Early Supporter"] = 512] = "Early Supporter";
    discordBadges[discordBadges["Team User"] = 1024] = "Team User";
    discordBadges[discordBadges["System"] = 4096] = "System";
    discordBadges[discordBadges["Bug Hunter Level 2"] = 16384] = "Bug Hunter Level 2";
    discordBadges[discordBadges["Verified Bot"] = 65536] = "Verified Bot";
    discordBadges[discordBadges["Early Verified Bot Developer"] = 131072] = "Early Verified Bot Developer";
})(discordBadges || (discordBadges = {}));
var premiumTypes;
(function (premiumTypes) {
    premiumTypes[premiumTypes["None"] = 0] = "None";
    premiumTypes[premiumTypes["Nitro Classic"] = 1] = "Nitro Classic";
    premiumTypes[premiumTypes["Nitro"] = 2] = "Nitro";
})(premiumTypes || (premiumTypes = {}));
function enumKeysAndValue(obj) {
    return Object.entries(obj).filter((array) => typeof array[0] === "string" && !isNaN(array[1]));
}
const discordBadgesArray = enumKeysAndValue(discordBadges);
const premiumTypesArray = enumKeysAndValue(premiumTypes);
const getDiscordBadges = (flag) => {
    const userBadges = [];
    discordBadgesArray.forEach(([badgeName, badgeFlag]) => badgeFlag & flag && userBadges.push(badgeName));
    return userBadges;
};
const getDiscordImage = (obj) => {
    const { imageHash, imageType, id, fileExtension } = obj;
    const baseURL = "https://discord.com/api/v8";
    let imageURL = baseURL;
    imageType.toLowerCase();
    // User_avatar and guild_icon has no checks but it supports all file extensions.
    switch (imageType) {
        case "user_avatar":
            // GIF's hash always starts with an a_
            if (imageHash.startsWith("a_"))
                imageURL += `/avatars/${id}/${imageHash}.${fileExtension}`;
            imageURL += `/avatars/${id}/${imageHash}.${fileExtension}`;
            break;
        case "guild_icon":
            if (imageHash.startsWith("a_"))
                imageURL += `/icons/${id}/${imageHash}.${fileExtension}`;
            imageURL += `/icons/${id}/${imageHash}.${fileExtension}`;
            break;
        case "guild_banner":
            if (fileExtension === "gif")
                throw new Error(`Guild banners can't be a GIF.`);
            imageURL += `/banners/${id}/${imageHash}.${fileExtension}`;
            break;
        case "guild_splash":
            break;
        default:
            throw new Error(`${imageType} is not a supported image type.`);
    }
    return imageURL;
};
exports.getDiscordImage = getDiscordImage;
