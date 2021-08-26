var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

const db = require("quick.db")
const ms = require('parse-ms')

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["mine", "tezit", "vytezit"],
    execute: async function(message, databaseUser) {

        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return

        let timeout = 60000;

        let mineTimeout = await db.fetch(`mineTimeout_${message.guild.id}_${message.author.id}`)

        if(mineTimeout === undefined) {
            db.add(`mineTimeout_${message.guild.id}_${message.author.id}`)
        }

        if(mineTimeout != null && timeout - (Date.now() - mineTimeout) > 0) {
            const time = ms(timeout - (Date.now() - mineTimeout));
            return message.inlineReply(discordEmbeds.warning(`Pozor`, `Ale klid ty frajere! Musíś si přeci taky někdy odpočinout.. **[** Zbývá:  ${time.seconds} sekund **]**`)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        // getting databases
        const ores = config.discord.economy

        const oreHistoryDatabase = await modules.mongodb.collections.orehistory.find({user_id: message.author.id}).toArray()
        const inventoryDatabase = await modules.mongodb.collections.inventory.find({user_id: message.author.id}).toArray()

        // getting mining informations
        var ownedPicks = {}
        var oreHistory = {}
        var canBeMined

        // getting data from player inventory
        inventoryDatabase.forEach(data => {
            if(data.item_id < 11 || data.item_id > 15) {
                return
            } else {
                ownedPicks[data.item_id] = (ownedPicks[data.item_id] || 0) + data.count
            }
        })

        // getting data from player hsitory ores
        oreHistoryDatabase.forEach(data => {
            oreHistory[data.ore_id] = (oreHistory[data.ore_id] || 0) + oreHistory[data.ore_id]
        })


        if(isEmpty(ownedPicks) === true) {
            ownedPicks = { '11': 1 }
        }

        // getting what can be mined with player's pickaxe = filtering
        Object.keys(ownedPicks).forEach(pickaxe => {
            var pickInfo = config.discord.economy[pickaxe]
            canBeMined = pickInfo.mineToList
        })

        // creating math functions for mining
        var randomOre = Math.floor(Math.random() * canBeMined.length) + 1

        var minedOre = ores[randomOre]
        var minedAmount = Math.floor(Math.random() * 4) + 1

        if(randomOre > 3) minedAmount = Math.floor(Math.random() * 1) + 1
        if(randomOre > 6) minedAmount = 1

        // checking ore history
        if(minedOre.id in oreHistory) {
            var alreadyMineEmbed = new npmmodules.Discord.MessageEmbed()
            .setTitle(`⚒️ Dolování`)
            .setColor('0x00000')
            .setDescription(`Tvou namáhavou prací jsi našel trochu nepotřebných materiálů a rud.`)
            .addField(`Získáno`, `**${minedAmount}x** ${minedOre.itemName}`)

            await db.set(`mineTimeout_${message.guild.id}_${message.author.id}`, Date.now())
            await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: minedOre.id, count: minedAmount})
            message.inlineReply(alreadyMineEmbed)

        } else {
            var newMineEmbed = new npmmodules.Discord.MessageEmbed()
            .setTitle(`⚒️ Dolování`)
            .setColor('0x00000')
            .setDescription(`Dole v dolech jsi právě objevil/a novou rudu!`)
            .addField(`Získáno`, `**${minedAmount}x** ${minedOre.itemName} ${minedOre.emoji}`)

            await db.set(`mineTimeout_${message.guild.id}_${message.author.id}`, Date.now())
            await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: minedOre.id, count: minedAmount})
            await modules.mongodb.collections.orehistory.insertOne({user_id: message.author.id, ore_id: minedOre.id})
            message.inlineReply(newMineEmbed)

        }
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/*
var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

const db = require("quick.db")
const ms = require('parse-ms')

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["mine", "tezit", "vytezit"],
    execute: async function(message, databaseUser) {
        let timeout = 60000;

        let mineTimeout = await db.fetch(`mineTimeout_${message.guild.id}_${message.author.id}`)

        if(mineTimeout === undefined) {
            db.add(`mineTimeout_${message.guild.id}_${message.author.id}`)
        }

        if(mineTimeout != null && timeout - (Date.now() - mineTimeout) > 0) {
            const time = ms(timeout - (Date.now() - mineTimeout));
            return message.inlineReply(discordEmbeds.warning(`Pozor`, `Ale klid ty frajere! Musíś si přeci taky někdy odpočinout.. **[** Zbývá:  ${time.seconds} sekund **]**`)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        // getting databases
        const ores = config.discord.economy

        const oreHistoryDatabase = await modules.mongodb.collections.orehistory.find({user_id: message.author.id}).toArray()
        const inventoryDatabase = await modules.mongodb.collections.inventory.find({user_id: message.author.id}).toArray()

        // getting mining informations
        var ownedPicks = {}
        var oreHistory = {}
        var canBeMined

        // getting data from player inventory
        inventoryDatabase.forEach(data => {
            if(data.item_id < 11 || data.item_id > 15) {
                return
            } else {
                ownedPicks[data.item_id] = (ownedPicks[data.item_id] || 0) + data.count
            }
        })

        // getting data from player hsitory ores
        oreHistoryDatabase.forEach(data => {
            oreHistory[data.ore_id] = (oreHistory[data.ore_id] || 0) + oreHistory[data.ore_id]
        })


        if(isEmpty(ownedPicks) === true) {
            ownedPicks = { '11': 1 }
        }

        
        // getting what can be mined with player's pickaxe = filtering
        Object.keys(ownedPicks).forEach(pickaxe => {
            var pickInfo = config.discord.economy[pickaxe]
            canBeMined = pickInfo.mineToList
        })

        // creating math functions for mining
        var randomOre = Math.floor(Math.random() * canBeMined.length) + 1

        var minedOre = ores[randomOre]
        var minedAmount = Math.floor(Math.random() * 4) + 1

        if(randomOre > 3) minedAmount = Math.floor(Math.random() * 1) + 1
        if(randomOre > 6) minedAmount = 1

        var randomEaster = Math.floor(Math.random() * 5) + 1

        // checking ore history
        if(minedOre.id in oreHistory) {
            var alreadyMineEmbed = new npmmodules.Discord.MessageEmbed()
            .setTitle(`⚒️ Dolování`)
            .setColor('0x00000')
            .setDescription(`Tvou namáhavou prací jsi našel trochu nepotřebných materiálů a rud.`)
            if(randomEaster === 1) {
                alreadyMineEmbed.addField(`Získáno`, `**${minedAmount}x** ${minedOre.itemName} a **1x** Velikonoční Vajíčko 🥚`)
                await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: 16, count: 1})

            } else {
                alreadyMineEmbed.addField(`Získáno`, `**${minedAmount}x** ${minedOre.itemName}`)
            }

            await db.set(`mineTimeout_${message.guild.id}_${message.author.id}`, Date.now())
            await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: minedOre.id, count: minedAmount})
            message.inlineReply(alreadyMineEmbed)

        } else {
            var newMineEmbed = new npmmodules.Discord.MessageEmbed()
            .setTitle(`⚒️ Dolování`)
            .setColor('0x00000')
            .setDescription(`Dole v dolech jsi právě objevil/a novou rudu!`)
            if(randomEaster === 1) {
                newMineEmbed.addField(`Získáno`, `**${minedAmount}x** ${minedOre.itemName} a **1x** Velikonoční Vajíčko 🥚`)
                await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: 16, count: 1})

            } else {
                newMineEmbed.addField(`Získáno`, `**${minedAmount}x** ${minedOre.itemName}`)
            }

            await db.set(`mineTimeout_${message.guild.id}_${message.author.id}`, Date.now())
            await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: minedOre.id, count: minedAmount})
            await modules.mongodb.collections.orehistory.insertOne({user_id: message.author.id, ore_id: minedOre.id})
            message.inlineReply(newMineEmbed)

        }
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}*/