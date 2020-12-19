import axios , { AxiosRequestConfig , AxiosError, AxiosResponse } from 'axios'
import { isPowerOfTwo } from './util'

type numArray = Array<number>
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

const getDiscordBadges = (flag : number) : string[] => {
    const userBadges : strArray = []
    discordBadgesArray.forEach(([badgeName , badgeFlag]) => badgeFlag & flag && userBadges.push(badgeName))

    return userBadges
}

const getPremiumType = (flag : 0 | 1 | 2) : string => premiumTypes[flag]

const getDate = (id : string) : { UTC : string , ISO : string , UNIX : number } => {
    const unixInMilli = (+id / 4194304) + 1420070400000
    const discordDate = new Date(unixInMilli)

    return {
        UTC : discordDate.toUTCString(),
        ISO : discordDate.toISOString(),
        UNIX : unixInMilli / 1000 | 1
    }
}

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

const getUser = (id : string) : Promise<DiscordUser> => {
    return new Promise<DiscordUser>(async ( resolve , reject ) => {
        try{
            const req : AxiosResponse<any> = await axios({
                method : "GET",
                url : `https://discord.com/api/v8/users/${id}`,
                headers : {
                    "Authorization" : "" // Added a configuration file where you can input your bot token.
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

            if(error.response){
                switch(error.response.status){
                    case 404:
                        reject("User not found!")
                    case 401:
                        reject("Unauthorized!")
                    default:
                        reject(error.response.status)
                }
            }

            reject(error)
        }
    })
}

export default {
    getImage,
    getDiscordBadges,
    getPremiumType,
    getUser,
    getDate
}