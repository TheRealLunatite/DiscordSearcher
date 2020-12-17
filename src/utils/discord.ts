import { isPowerOfTwo } from './util'

type numArray = Array<number>
type strArray = Array<string>
type fileExtension = "png" | "jpeg" | "webp" | "gif"

interface DiscordImage {
    imageType : string;
    imageHash : string;
    id : string;
    fileExtension : fileExtension;
    size? : number;
}

enum discordBadges {
   "None",
   "Discord Employee" = 1 << 0,
   "Partnered Server Owner" = 1 << 1,
   "HypeSquad Events" = 1 << 2,
   "Bug Hunter Level 1" = 1 << 3,
   "House Bravery" = 1 << 6,
   "House Brilliance" = 1 << 7,
   "House Balance" = 1 << 8,
   "Early Supporter" = 1 << 9,
   "Team User" = 1 << 10,
   "System" = 1 << 12,
   "Bug Hunter Level 2" = 1 << 14,
   "Verified Bot" = 1 << 16,
   "Early Verified Bot Developer" = 1 << 17
}

enum premiumTypes{
    "None",
    "Nitro Classic" = 1,
    "Nitro" = 2
}

function enumKeysAndValue(obj : object) : [string , number][]{
    return Object.entries(obj).filter((array) => typeof array[0] === "string" && !isNaN(array[1]))
}

const discordBadgesArray = enumKeysAndValue(discordBadges)
const premiumTypesArray = enumKeysAndValue(premiumTypes)

const getDiscordBadges = (flag : number) : string[] => {
   const userBadges : strArray = []
    discordBadgesArray.forEach(([badgeName , badgeFlag]) => badgeFlag & flag && userBadges.push(badgeName))

    return userBadges
}

const getImage = (obj : DiscordImage) : string => {
    const { imageHash , imageType , id , fileExtension , size } = obj
    const baseURL = "https://cdn.discordapp.com"
    let imageURL = baseURL

    imageType.toLowerCase()

    // User_avatar and guild_icon has no checks but it supports all file extensions.
    switch(imageType){
        case "user_avatar":
            if(imageHash.startsWith("a_")){
                imageURL += `/avatars/${id}/${imageHash}.${fileExtension}`
                break
            }

            imageURL += `/avatars/${id}/${imageHash}.${fileExtension}`
            break
        case "guild_icon":
            if(imageHash.startsWith("a_")){
                imageURL += `/icons/${id}/${imageHash}.${fileExtension}`
                break
            }

            imageURL += `/icons/${id}/${imageHash}.${fileExtension}`
            break
        case "guild_banner":
            if(fileExtension === "gif") throw new Error(`Guild banners can't be a GIF.`)   

            imageURL += `/banners/${id}/${imageHash}.${fileExtension}`
            break
        case "guild_splash":
            break
        default:
            throw new Error(`${imageType} is not a supported image type.`)
    }

    // Image size can be any power of two between 16 and 4096
    size && isPowerOfTwo(size) && (size >= 16 && size <= 4096) ? imageURL += `?size=${size}` : imageURL += '?size=128'

    return imageURL
}

export default {
    getImage
}