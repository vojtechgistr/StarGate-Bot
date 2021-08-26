var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["buy", "koupit"],
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
            return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / tento item neexistuje\nPoužití \`${config.discord.bot.prefix}buy \`**\`[item ID]\`**`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        if(isNaN(arg1)) return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / tento item neexistuje\nPoužití \`${config.discord.bot.prefix}buy \`**\`[item ID]\`**`).setTitle('❌ Pozor!')).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })

        var selectedItem = config.discord.economy[message.args[1]]

        if(!selectedItem) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Item s tímto ID neexistuje!`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }
        
        if(!selectedItem.id > 10 && !selectedItem.id < 16) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Item s tímto ID nelze koupit!`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }


        if(!arg1 === economy[arg1].itemName || !arg1 === economy[arg1] && !arg1 < 11) {
            return message.channel.send(discordEmbeds.warning().setDescription(`Byl zadán neplatný item / tento item neexistuje\nPoužití \`${config.discord.bot.prefix}buy \`**\`[item ID]\`**`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        const economyDatabase = await modules.mongodb.collections.inventory.find({user_id: message.author.id}).toArray()

        let count = 1
        
        var ownedItems = {}

        economyDatabase.forEach(data => {
            ownedItems[data.item_id] = (ownedItems[data.item_id] || 0) + data.count
        })

        if(!selectedItem.buyingPrice && selectedItem.buyingPrice !== 0){
            return message.channel.send(discordEmbeds.warning().setDescription("Tento předmět si nemůžeš koupit!").setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        if(ownedItems[message.args[1]] > 0) {
            message.channel.send(discordEmbeds.warning().setDescription(`Tento předmět již vlastníš!`).setTitle('❌ Pozor!')).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })

            if(ownedItems[message.args[1]] > 1) {
                await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: Number(message.args[1]), count: (ownedItems[message.args[1]] * -1) + 1})
                return
            }
            return
        }

        let price = Number(selectedItem.buyingPrice)

         const willLose = count * price

         let embed = new npmmodules.Discord.MessageEmbed()
         .setTitle(`🛍️ Tržnice`)
         .setDescription(`Právě jsi koupil **\`${count}\`**${selectedItem.itemName} za ${willLose} :coin: SC`)
         .setColor(`0x76da0d`)

         var economyUser = await modules.mongodb.collections.economy.find({user_id: message.author.id}).toArray()

         var bal = 0
         var total = 0
 
         economyUser.forEach(data => {
             bal = parseInt(data.wallet)
             total = parseInt(data.total)
         });
        

         if(bal < price) {
             return message.channel.send(discordEmbeds.warning().setDescription(`Na tento předmět nemáš dostatek peněz!`).setTitle('❌ Pozor!')).then(m => {
                 m.delete({timeout: 10000})
                 message.delete({timeout: 10000})
             })
         }


         await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: Number(message.args[1]), count: count})
         await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {wallet: bal - willLose, total: total - willLose}})

         message.inlineReply(embed)
    }
}