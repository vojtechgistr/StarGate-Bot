var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["bal", "bank", "balance", "account", "ball", "ballance"],
    execute: async function(message, databaseUser){

        var db = require('quick.db')
        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return

            
        const economy = await modules.mongodb.collections.economy.find({user_id: message.author.id}).toArray()

        var bal = 0
        var bank = 0

        var economyList = {}

        economy.forEach(data => {
            bal = parseInt(data.wallet)
            bank = parseInt(data.bank)
            economyList = data
        });


        if(isEmpty(economyList) === true) {
            await modules.mongodb.collections.economy.insertOne({user_id: message.author.id, wallet: 0, bank: 0, total: 0})
        }

        var embed = new npmmodules.Discord.MessageEmbed()
            .setColor('0xffc629')
            .setTitle(`💵 Informace o Účtě`)
            .addField("Peněženka", `${bal} 🪙 SC`)
            .addField("Bankovní účet", `${bank} 🪙 SC`)

        message.inlineReply(embed)

    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}