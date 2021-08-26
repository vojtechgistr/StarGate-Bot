var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["item", "predmet", "info", "informace"],
    execute: async function(message, databaseUser){

        var db = require('quick.db')
        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return

        
        const economy = config.discord.economy

        const num = message.args[1]
        

        if(!num) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / item neexistuje\nVyzkoušejte například \`${config.discord.bot.prefix}item 1\``).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        if(isNaN(num)) return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / item neexistuje\nVyzkoušejte například \`${config.discord.bot.prefix}item 1\``).setTitle('❌ Pozor!')).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })
        
        if(num > 16) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / item neexistuje\nVyzkoušejte například \`${config.discord.bot.prefix}item 1\``).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }
        const embed = new npmmodules.Discord.MessageEmbed()
            .setTitle(economy[num].emoji + " " + economy[num].itemName)

            if(economy[num].typ === "Ruda"){
                embed.setDescription(`➤ Typ tohoto itemu je ***${economy[num].typ}***\n➤ Tuto rudu lze prodat za ***${economy[num].sellingPrice} :coin: SC***\n➤ Potřebný nástroj k vytěžení je ***${economy[num].pickNeeded}***`)
            } else if(economy[num].typ === "Vajíčko"){
                embed.setDescription(`➤ Typ tohoto itemu je ***${economy[num].typ}***\n➤ Vajíčka nelze prodat, jsou pouze součástí eventu!\n➤ Potřebný nástroj k získání je ***${economy[num].pickNeeded}***`)
            } else {
                if(economy[num].buyingPrice === "0") {
                    embed.setDescription(`➤ Typ tohoto itemu je ***${economy[num].typ}***\n➤ Tento předmět nelze prodat\nS tímto předmětem lze ***${economy[num].canBeDone}***\n➤ Tento předmět je samozřejmostí každého člena`)
                } else {
                    embed.setDescription(`➤ Typ tohoto itemu je ***${economy[num].typ}***\n➤ Tento předmět nelze prodat\nS tímto předmětem lze ***${economy[num].canBeDone}***\n➤ Tento předmět můžete koupit za ***${economy[num].buyingPrice} :coin: SC***`)
                }
            }

        message.inlineReply(embed)
    }
}