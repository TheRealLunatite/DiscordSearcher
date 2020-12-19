/**
 * @jest-environment node
 */

import discord from './discord'
import user1 from "./user1.json"
import user2 from './user2.json'

test('getDiscordImage()' , () => {
    const userAvatarURL = discord.getImage({
        imageType : "user_avatar",
        imageHash : "9bdd3c1ca042bd1bd4c00da066f991e4",
        id : "573639162733789197",
        fileExtension : "webp",
        size : 128
    })

    const guildIconURL = discord.getImage({
        imageType : "guild_icon",
        imageHash : "a_83d8cb843b573a37301c83b820e53504",
        id : "541484311354933258",
        fileExtension : "gif",
        size : 4096
    })


    expect(userAvatarURL).toBe("https://cdn.discordapp.com/avatars/573639162733789197/9bdd3c1ca042bd1bd4c00da066f991e4.webp?size=128")
    expect(guildIconURL).toBe("https://cdn.discordapp.com/icons/541484311354933258/a_83d8cb843b573a37301c83b820e53504.gif?size=4096")
})


test("getDiscordBadges()" , () => {
    const houseBalance = discord.getDiscordBadges(256)
    const houseBrilliance = discord.getDiscordBadges(128)
    const houseBravery = discord.getDiscordBadges(64)

    expect(houseBalance).toContain("House Balance")
    expect(houseBrilliance).toContain("House Brilliance")
    expect(houseBravery).toContain("House Bravery")
})

test("getPremiumType()" , () => {
    expect(discord.getPremiumType(0)).toBe("None")
    expect(discord.getPremiumType(1)).toBe("Nitro Classic")
    expect(discord.getPremiumType(2)).toBe("Nitro")
})

test("getUser()" , async () => {
    expect(discord.getUser("424606447867789312")).resolves.toStrictEqual(user1)
    expect(discord.getUser("509407382347055104")).resolves.toStrictEqual(user2)
    expect(discord.getUser("1")).rejects.toMatch("User not found!")
})

test("getDate" , () => {
    expect(discord.getDate("424606447867789312")).toStrictEqual({
        UTC : "Sat, 17 Mar 2018 16:34:25 GMT",
        ISO : "2018-03-17T16:34:25.978Z",
        UNIX : 1521304465
    })
})