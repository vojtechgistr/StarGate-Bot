var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")
const haveItem = require("../modules/have-item")

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["sell", "prodat"],
    execute: async function(message, databaseUser) {

        var db = require('quick.db')
        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return


        const economy = config.discord.economy

        const arg1 = message.args[1]
        const arg2 = message.args[2]

        if(!arg1) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / tento item neexistuje\nPoužití \`${config.discord.bot.prefix}sell \`**\`[ore ID] [množství]\`**`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        if(isNaN(arg1)) return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / tento item neexistuje\nPoužití \`${config.discord.bot.prefix}sell \`**\`[ore ID] [množství]\`**`).setTitle('❌ Pozor!')).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })

        if(arg2 && isNaN(arg2)) return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný počet\nPoužití \`${config.discord.bot.prefix}sell [ore ID] \`**\`[množství]\`**`).setTitle('❌ Pozor!')).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })

        var selectedItem = config.discord.economy[message.args[1]]

        if(!selectedItem) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Ruda s tímto ID neexistuje!`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        if(!selectedItem.sellingPrice && selectedItem.sellingPrice !== 0){
            return message.channel.send(discordEmbeds.warning().setDescription("Tento předmět nemůžeš prodat!").setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }


        if(!arg1 === economy[arg1].itemName || !arg1 === economy[arg1] && !arg1 < 11) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / item neexistuje\nPoužití \`${config.discord.bot.prefix}sell \`**\`[ore ID]\`**\` [množství]\``).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        let count = 1


        if(Number(message.args[2]) && Number(message.args[2]) > 0)
        count = Math.round(Number(message.args[2]))

        const inventoryDatabase = await modules.mongodb.collections.inventory.find({user_id: message.author.id}).toArray()

        var inventoryList = {}
        var have

        inventoryDatabase.forEach(data => {
            if(data.item_id > 10) {
                return
            } else {
                inventoryList[data.item_id] = (inventoryList[data.item_id] || 0) + data.count
            }
        })

        have = inventoryList[selectedItem.id]
        if(have === undefined) have = 0
        
        if(have < count) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Měl bys začít těžit kamaráde, žádné podvody tady nechceme!\nTolik rud bohužel nevlastníš [ ${count} ]`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        let price = selectedItem.sellingPrice

         const willGet = count * price

         let embed = new npmmodules.Discord.MessageEmbed()
         .setTitle(`🛍️ Tržnice`)
         .setDescription(`Právě jsi prodal **\`${count}\`**${selectedItem.itemName} za ${willGet} :coin: SC`)
         .setColor(`0x76da0d`)


         const economyDatabase = await modules.mongodb.collections.economy.find({user_id: message.author.id}).toArray()

         var bal = 0
         var total = 0
 
         economyDatabase.forEach(data => {
             bal = parseInt(data.wallet)
             total = parseInt(data.total)
         });


         await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: Number(message.args[1]), count: count * -1})
         await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {wallet: bal + willGet, total: total + willGet}})

         return message.inlineReply(embed)
    }
}