var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require('../config.json')

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["ore", "ores", "rudy"],
    execute: async function(message, databaseUser) {

        var db = require('quick.db')
        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return

        const num = message.args[1]

        var embed = new npmmodules.Discord.MessageEmbed()
            .setTitle(`🛍️ Market`)
            .setColor(`0x76da0d`)
            .setFooter(`Můžeš prodávat pomocí ` + config.discord.bot.prefix + `sell [item ID] [množství]`)

            var ownedItems = config.discord.economy

            Object.keys(ownedItems).forEach(ownedItem => {
                if(ownedItems[ownedItem] === 0) return
                if(ownedItems[ownedItem].id > 10) return
    
                var itemInfo = config.discord.economy[ownedItem]
                embed.addField(`\`${ownedItem}\`) ${itemInfo.itemName} ${itemInfo.emoji}`, `\n➤ Prodejní cena činí **${itemInfo.sellingPrice}** ${config.discord.bot.currency}\n➤ Rozsáhlé informace o rudě:\n\`${config.discord.bot.prefix}item ${ownedItem}\``)
        })
        message.inlineReply(embed)
    }
}