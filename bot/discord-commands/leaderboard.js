var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

module.exports = {
    permissions: [],
    prefixes: ["leaderboard", "leadboard", "top", "lead", "board"],
    execute: async function(message, databaseUser){

        var db = require('quick.db')
        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return

        /*if(message.args[1] === "egg") {

            const inventory = await modules.mongodb.collections.eggs.find().sort({total: -1}).toArray()

            let content = ``

            for(let i = 0; i < inventory.length; i++) {
                if(i === 10) {
                    break
                } else {
                    content = await content + `\n**${i+1}.)** <@${await inventory[i].user_id}> ➤ **${inventory[i].total}\n`
                }
                
            }
            var em = new npmmodules.Discord.MessageEmbed()
                .setTitle(`📈 Server Leaderboard`)
                .setDescription(await content)
                .setColor('RED')
    
            await message.inlineReply(em)

        } else {*/
            const economy = await modules.mongodb.collections.economy.find().sort({total: -1}).toArray()

            let content = ``
    
            for(let i = 0; i < economy.length; i++) {
                if(i === 10) {
                    break
                } else {
                    content = await content + `\n**${i+1}.)** <@${await economy[i].user_id}> ➤ **${economy[i].bank + economy[i].wallet}** ${config.discord.bot.currency}\n`
                }
                
            }
            var em = new npmmodules.Discord.MessageEmbed()
                .setTitle(`📈 Server Leaderboard`)
                .setDescription(await content)
                .setColor('RED')
    
            await message.inlineReply(em)
        //}
    
    }
}