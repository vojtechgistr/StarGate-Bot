var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

module.exports = {
    permissions: [],
    prefixes: ["dep", "deposit", "vlozit", "dp"],
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

       let count = message.args[1]


        if(isEmpty(economyList) === true) {
            await modules.mongodb.collections.economy.insertOne({user_id: message.author.id, wallet: 0, bank: 0, total: 0})
        }

        if(!count) {
            return message.inlineReply(discordEmbeds.warning('Pozor', `Nebyla zadána částka, která má být vložena na účet\nSprávné použití ➤ \`${config.discord.bot.prefix}dep [množství/all]\``)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        if(message.args[1].toLowerCase() === "all") {

            if(bal === 0) {
                return message.inlineReply(discordEmbeds.warning('Pozor', `Nemůžeš vložit **0 ${config.discord.bot.currency}**!\nSprávné použití ➤ \`${config.discord.bot.prefix}dep [množství/all]\``)).then(m => {
                    m.delete({timeout: 10000})
                    message.delete({timeout: 10000})
                })
            }

            var em = new npmmodules.Discord.MessageEmbed()
            .setTitle(`💰 Vložení Peněz`)
            .setDescription(`Úspěšně sis vložil **${bal} ${config.discord.bot.currency}** do banky, v peněžence ti nic nezůstalo`)
            .setColor(`0xebb134`)

            await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {wallet: 0, bank: bank + bal}})

        return message.inlineReply(em)

        } else if(!isNaN(message.args[1])) {
            
            if(bal < count) {
                return message.inlineReply(discordEmbeds.warning('Pozor', `Nemůžeš generovat peníze!\nSprávné použití ➤ \`${config.discord.bot.prefix}dep [množství/all]\``)).then(m => {
                    m.delete({timeout: 10000})
                    message.delete({timeout: 10000})
                })
            }

            if(count === "0") {
                return message.inlineReply(discordEmbeds.warning('Pozor', `Nemůžeš vložit **0 ${config.discord.bot.currency}**!\nSprávné použití ➤ \`${config.discord.bot.prefix}dep [množství/all]\``)).then(m => {
                    m.delete({timeout: 10000})
                    message.delete({timeout: 10000})
                })
            }

        var em = new npmmodules.Discord.MessageEmbed()
            .setTitle(`💰 Vložení Peněz`)
            .setDescription(`Úspěšně sis vložil **${count} ${config.discord.bot.currency}** do banky, v peněžence ti zůstalo **${bal - count} ${config.discord.bot.currency}**`)
            .setColor(`0xebb134`)

            await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {wallet: bal - count, bank: bank + Number(count)}})

        return message.inlineReply(em)

    } else {
        return message.inlineReply(discordEmbeds.warning('Pozor', `Byl zadán nesprávný formát příkazu!\nSprávné použití ➤ \`${config.discord.bot.prefix}withdraw [množství/all]\``)).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })
    }
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}