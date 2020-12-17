import discord from './discord'

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


    expect(() => discord.getImage({
        imageType : "guild_banner",
        imageHash : "1b56139d894e57a9d3fdfc586caa4f72",
        id : "607673111692836873",
        fileExtension : "gif"
    })).toThrow(Error)

    expect(userAvatarURL).toBe("https://cdn.discordapp.com/avatars/573639162733789197/9bdd3c1ca042bd1bd4c00da066f991e4.webp?size=128")
    expect(guildIconURL).toBe("https://cdn.discordapp.com/icons/541484311354933258/a_83d8cb843b573a37301c83b820e53504.gif?size=4096")
})

