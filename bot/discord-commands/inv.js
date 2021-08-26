var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

require('../modules/ReplyMessage')

var config = require("../config.json")
const { user } = require("../modules/discord-client")

module.exports = {
    permissions: [],
    prefixes: ["inv", "inventory", "stats"],
    execute: async function(message, databaseUser){

        var db = require('quick.db')
        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return


        const ecUser = await modules.mongodb.collections.inventory.find({user_id: message.author.id}).toArray()

        if(ecUser.length === 0) {
            const nope = new npmmodules.Discord.MessageEmbed()
                .setTitle("📦 Inventář 📦")
                .setDescription(`Omlouvám se, ale nic kromě tvého Základního Krumpáče jsem tady nenašel! Zkus si první něco natěžit nebo koupit.`)
                .setColor('0xffc629')

            return message.inlineReply(nope)
        }

        var inventoryEmbed = new npmmodules.Discord.MessageEmbed()
            .setColor('0xffc629')
            .setTitle("📦 Inventář 📦")

        var ownedItems = {}

        ecUser.forEach(data => {
            if(data.item_id === 16) {
                
            } else {
                ownedItems[data.item_id] = (ownedItems[data.item_id] || 0) + data.count
            }
            
        })

        Object.keys(ownedItems).forEach(ownedItem => {
            if(ownedItems[ownedItem] === 0)
                return
            if(ownedItems[ownedItem].itemid === 16)
                return

            var itemInfo = config.discord.economy[ownedItem]
            inventoryEmbed.addField(`\`${ownedItem}\`) ${itemInfo.itemName} ${itemInfo.emoji}`, `Množství - ***${ownedItems[ownedItem]}***\nStatistiky předmětu ➤ \`${config.discord.bot.prefix}item ${ownedItem}\``)
        })

        message.inlineReply(inventoryEmbed)
    }
}