var npmmodules = require("./npm-modules")

var modules = require("./modules")

var config = require("./config.json")
var db = require("quick.db")

var discordEmbeds = require("./discord-embeds")

const mongo = require('./modules/mongodb')
const { user } = require("./modules/discord-client")
const { discordClient } = require("./modules")

modules.discordClient.on("message", async (message) => {
    

    if(message.content.startsWith(config.discord.bot.prefix))
        message.args = message.content.slice(config.discord.bot.prefix.length, message.content.length).split(" ")
    else
        message.args = message.content.split(" ")

    if(message.author.bot)
        return

    if(message.channel.type == "dm")
        return

        if(message.content.startsWith(config.discord.bot.prefix)) {
            
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

        }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// egg event
        /*const eggDB = await modules.mongodb.collections.eggs.find({user_id: message.author.id}).toArray()

        var egg = 0

        var eggList = {}

        eggDB.forEach(data => {
            egg = parseInt(data.total)
            eggList = data
        });


        if(isEmpty(eggList) === true) {

            const ecUser = await modules.mongodb.collections.inventory.find({user_id: message.author.id}).toArray()

            if(ecUser.length === 0) {
                await modules.mongodb.collections.eggs.insertOne({user_id: message.author.id, total: 0})
                return
            }

            var ownedItems = {}
    
            ecUser.forEach(data => {
                if(data.item_id == 16) {
                    ownedItems[data.item_id] = (ownedItems[data.item_id] || 0) + data.count
                } else return
            })
    
            Object.keys(ownedItems).forEach(async ownedItem => {
                await modules.mongodb.collections.eggs.insertOne({user_id: message.author.id, total: ownedItems[ownedItem]})
            })
        }*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    
    var databaseUser = await modules.mongodb.collections.users.findOne({discord_id: message.author.id})
    if(!databaseUser){

        let inserted = await modules.mongodb.collections.users.insertOne({discord_id: message.author.id})

        if((await modules.mongodb.collections.users.find({discord_id: message.author.id}).toArray()).length > 2){
            await modules.mongodb.collections.users.deleteOne({_id: inserted.insertedId})
        }

        databaseUser = await modules.mongodb.collections.users.findOne({discord_id: message.author.id})

    }

    if(message.content.startsWith(config.discord.bot.prefix)){

        let commandFiles = npmmodules.fs.readdirSync("./discord-commands")

        commandFiles.forEach(commandFile => {

            var command = require(`./discord-commands/${commandFile}`)

            if(!command.prefixes.includes(message.args[0].toLowerCase()))
                return

            if(command.permissions){

                for(var i = 0; i < command.permissions.length; i++){

                    if(!message.member.permissions.has(command.permissions[i])){
    
                        message.reply(discordEmbeds.warning("Na toto nemáš oprávnění", `Potřebné oprávnění: ${commandFiles.permissions.join(", ")}`))
                        return
    
                    }
    
                }

            }
            
            if(command.roles){

                for(var i = 0; i < command.roles.length; i++){

                    if(!message.member.roles.cache.get(command.roles[i])){
    
                        var rolesString = ""

                        command.roles.forEach(role => {
                            rolesString += "<@&" + role + "> "
                        })

                        message.reply(discordEmbeds.warning("Na toto nemáš oprávnění", `Potřebné role: ${rolesString}`))
                        return
    
                    }
    
                }

            }
            

            command.execute(message, databaseUser)

        })

    }
})

const { Permissions } = require('discord.js');

modules.discordClient.on("ready", async () => {
    
    let server = modules.discordClient.guilds.cache.get("825457047025221682");
    let channel = modules.discordClient.channels.cache.get("847450754797010954");
    let player = await server.members.fetch('484448041609199620');

    channel.updateOverwrite(player.id, {
        SEND_MESSAGES: true
    });
    

    console.log("Discord bot started")
    console.log("---------------------")


    modules.discordClient.user.setPresence({
        status: 'online',
        activity: {
            name: config.discord.bot.prefix + 'help',
            type: 'LISTENING'
        }
    })
})

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}