import axios , { AxiosError, AxiosResponse } from 'axios'
import { createCanvas , loadImage , registerFont } from "canvas"
import { isPowerOfTwo } from '../util'
import path from 'path'

// Types
type strArray = Array<string>
type imageType = "default" | "guild_icon" | "user_avatar"
type fileExtension = "png" | "jpeg" | "webp" | "gif"

interface DiscordResponseData {
    id : string;
    username : string;
    discriminator : string;
    public_flags : number;
    avatar : string | null;
}

interface DiscordImage {
    imageType : imageType;
    fileExtension : fileExtension;
    imageHash? : string;
    id? : string;
    size? : number;
    discriminator? : number
}

interface DiscordUser {
    id : string,
    username : string,
    avatar : string,
    discriminator : string,
    badges : strArray
}

interface DateResponse {
    UTC : string;
    ISO : string;
    UNIX : number;
}

// Register Canvas Font
registerFont(path.join(__dirname , "./Montserrat-Regular.ttf"), { family : "Montserrat" })

/**
 * @enum {number}
 */
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

/**
 * @enum {number}
 */
enum premiumTypes{
    "None",
    "Nitro Classic" = 1,
    "Nitro" = 2 
}

function enumKeysAndValue(obj : object) : [string , number][]{
    return Object.entries(obj).filter((array) => typeof array[0] === "string" && !isNaN(array[1]))
}

const discordBadgesArray = enumKeysAndValue(discordBadges)

/**
 * Get all the badges of a user
 * @param {number} flag - user flag 
 * @returns {string[]} - Array of badge names
 */
const getDiscordBadges = (flag : number) : string[] => {
    const userBadges : strArray = []
    discordBadgesArray.forEach(([badgeName , badgeFlag]) => badgeFlag & flag && userBadges.push(badgeName))

    return userBadges
}

/**
 * Get the premium type of a user
 * @param {number} flag - user flag
 * @returns {string} - premium type 
 */
const getPremiumType = (flag : 0 | 1 | 2) : string => premiumTypes[flag]

/**
 * Get the date of a discord id
 * @param {string} id - discord id
 * @returns {DateResponse}
 */
const getDate = (id : string) : DateResponse => {
    const unixInMilli = (+id / 4194304) + 1420070400000
    const discordDate = new Date(unixInMilli)

    return {
        UTC : discordDate.toUTCString(),
        ISO : discordDate.toISOString(),
        UNIX : unixInMilli / 1000 | 1
    }
}

/**
 * Get the url of a user's profile link.
 * @param {DiscordImage} obj
 * @returns {string} - URL to image.
 */
const getImage = (obj : DiscordImage) : string => {
    const { imageHash , imageType , id , fileExtension , size , discriminator } = obj
    const baseURL = "https://cdn.discordapp.com"
    let imageURL = baseURL

    imageType.toLowerCase()

    switch(imageType){
        case "user_avatar":
        case "guild_icon":
            if(!id || !fileExtension || !imageHash) throw new Error("File extension, id , or image hash object property is missing.")    

            if(imageType === "user_avatar") imageURL += `/avatars/${id}/${imageHash}.${fileExtension}`
            if(imageType === "guild_icon") imageURL += `/icons/${id}/${imageHash}.${fileExtension}`

            break
        case "default":
            if(!discriminator) throw new Error('Discriminator wasn\'t provided.')

            imageURL += `/embed/avatars/${discriminator % 5}.png`
            break
        default:
            throw new Error(`${imageType} is not a supported image type.`)
    }

    // Image size can be any power of two between 16 and 4096
    size && isPowerOfTwo(size) && (size >= 16 && size <= 4096) ? imageURL += `?size=${size}` : imageURL += '?size=128'

    return imageURL
}

/**
 * Get information on a discord user with an id
 * @param {string} id - discord id 
 * @return {DiscordUser} an object containing information about the user
 */
const getUser = (id : string) : Promise<DiscordUser> => {
    return new Promise<DiscordUser>(async ( resolve , reject ) => {
        try{
            const req : AxiosResponse<any> = await axios({
                method : "GET",
                url : `https://discord.com/api/v8/users/${id}`,
                headers : {
                    "Authorization" : "" /* Add your bot token here. Will have an .env file to add envirn vars */ ,
                    "User-Agent" : `DiscordBot ($https://discord.com/api/v8/users/${id}, $8)`
                }
            })

            const { username , avatar : avatarHash , discriminator , public_flags } : DiscordResponseData = req.data
            const avatarURL = (avatarHash === null) ? 
                getImage({ imageType : "default" , fileExtension : "webp" , discriminator : +discriminator , size : 4096}) : 
                (avatarHash.startsWith("a_")) ? 
                getImage({ imageType : "user_avatar" , imageHash : avatarHash , id , fileExtension : "gif" , size : 4096 }) : 
                getImage({ imageType : "user_avatar" , fileExtension : "webp" , imageHash : avatarHash , size : 4096 , id})

            const badges = getDiscordBadges(public_flags)

            resolve({
                id,
                username,
                discriminator,
                avatar : avatarURL,
                badges
            })

        } catch (e) {
            const error : AxiosError = e

            if(error.response) reject(error.response.status)

            reject(error)
        }
    })
}

/**
 * Creates a signature with Canvas using details of a Discord user.
 * @param {string} avatarURL - discord avatar url
 * @param {string} id - discord ID
 * @param {string} username - discord username
 * @returns {PromiseLike<string>} - data url
 */
const createSignature = async (avatarURL : string , id : string , username : string) : Promise<string> => {
    // const usernameRegex = /.+#[0-9]{4}/g
    // const searchForMatch = usernameRegex.exec(username)

    // if(searchForMatch === null) throw new Error("Username is invalid. Please use the full username along with the discriminator.")

    // username = searchForMatch[0] // The full string of characters matched.

    const canvas = createCanvas(800 , 200)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#36393F"
    
    //Background
    ctx.fillRect(0 , 0 , canvas.width , canvas.height)
    
    // Draw Icon
    const image = await loadImage(avatarURL)
    ctx.drawImage(image, 10 , 10 , 180 , canvas.height - 20)

    // Text
    ctx.textAlign = "right"
    ctx.fillStyle = "white"
    ctx.font = `16px "Montserrat"`
    ctx.fillText("https://discordsearcher.pw" , canvas.width - 10, canvas.height - 10)
    ctx.textAlign = "center"

    const usernameLength = username.split("#")[0].length

    switch(true){
        case (usernameLength <= 10):
            ctx.font = '64px "Montserrat"'
            break
        case (usernameLength > 10 && usernameLength <= 18):
            ctx.font = '48px "Montserrat"'
            break
        case (usernameLength > 18 && usernameLength <= 26):
            ctx.font = '32px "Montserrat"'
            break
        default:
            ctx.font = '24px "Montserrat"'
    }

    ctx.fillText(username , (canvas.width / 2) + 95, (canvas.height / 2) , 550)
    ctx.font = '32px "Montserrat"'
    ctx.fillText(id , (canvas.width / 2) + 95 , (canvas.height / 2) + 30)

    return canvas.toDataURL()
}

export default {
    getImage,
    getDiscordBadges,
    getPremiumType,
    getUser,
    getDate,
    createSignature
}