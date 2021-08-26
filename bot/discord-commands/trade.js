//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// THIS CODE IS NOT DONE YET! ///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var modules = require("../modules")
 
var npmmodules = require("../npm-modules")
 
var discordEmbeds = require("../discord-embeds")
 
var config = require("../config.json")
 
var db = require('quick.db')
const { setTimeout } = require("../modules/discord-client")
 
require('../modules/ReplyMessage')
 
module.exports = {
    permissions: [],
    prefixes: ["trade", "transfer", "pay", "send"],
    execute: async function(message, databaseUser) {
 
        if(!message.guild.me.hasPermission("ADD_REACTIONS")) return message.inlineReply("I do not have the permission to add reactions.")
 
        // creating timeout
        let timeout = 0;
 
        // getting from database
        let tradeTimeout = await db.fetch(`tradeTimeout_${message.guild.id}_${message.author.id}`)
 
        if(tradeTimeout === undefined) {
            db.add(`tradeTimeout_${message.guild.id}_${message.author.id}`)
        }
 
        // checking if user has command timeout
        if(tradeTimeout != null && timeout - (Date.now() - tradeTimeout) > 0) {
            const time = ms(timeout - (Date.now() - tradeTimeout));
            return message.channel.send(discordEmbeds.warning(`Pozor`, `Ale klid ty frajere! Musíś si přeci taky někdy odpočinout od toho dealování.. **[** Zbývá:  ${time.seconds} sekund **]**`)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }
 
        // argument conditions
        if(!message.args[1]) {
            return message.channel.send(discordEmbeds.warning('Pozor', `Nesprávný formát příkazu!\nPoužití \`${config.discord.bot.prefix}trade [member]\``)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }
 
        var user = message.mentions.users.first()
        var user2 = message.mentions.users.first()
 
        if(!user) return message.channel.send(discordEmbeds.warning(`Chyba`, `Omlouvám se, ale tohoto uživatele jsem nenašel..\nPoužití \`${config.discord.bot.prefix}trade \`**\`[member]\`**\``)).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })
 
        if(user.bot) return message.channel.send(discordEmbeds.warning(`Pozor`, `Boti nejsou součástí ekonomiky!`)).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })
 
        if(user.id === message.author.id) return message.channel.send(discordEmbeds.warning(`Pozor`, `Nemůžeš tradovat sam se sebou ty hlupáku.`)).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })
 
        //my bal
        const economy = await modules.mongodb.collections.economy.find({user_id: message.author.id}).toArray()
 
        var bal = 0
        var userBank = 0
        var userTotal = 0
 
        var economyList = {}
 
        economy.forEach(data => {
            bal = parseInt(data.wallet)
            userBank = parseInt(data.bank)
            userTotal = parseInt(data.total)
            economyList = data
        });
 
 
        if(isEmpty(economyList) === true) {
            await modules.mongodb.collections.economy.insertOne({user_id: message.author.id, wallet: 0, bank: 0, total: 0})
        }
 
        //his bal
        const economy2 = await modules.mongodb.collections.economy.find({user_id: user.id}).toArray()
 
        var hisBal = 0
        var hisBank = 0
        var hisTotal = 0
        var economyList2 = {}
 
        economy2.forEach(data => {
            hisBal = parseInt(data.wallet)
            hisBank = parseInt(data.bank)
            hisTotal = parseInt(data.total)
            economyList2 = data
        });
 
 
        if(isEmpty(economyList2) === true) {
            await modules.mongodb.collections.economy.insertOne({user_id: user.id, wallet: 0, bank: 0, total: 0})
        }
 
        // my inventory
        const myItems = await modules.mongodb.collections.inventory.find({user_id: message.author.id}).toArray()
        var myInventory = {}
 
        myItems.forEach(data => {
            myInventory[data.item_id] = (myInventory[data.item_id] || 0) + data.count
        })
 
        // his inventory
        const hisItems = await modules.mongodb.collections.inventory.find({user_id: user.id}).toArray()
        var hisInventory = {}
 
        hisItems.forEach(data => {
            hisInventory[data.item_id] = (hisInventory[data.item_id] || 0) + data.count
        })
 
        var yess = new npmmodules.Discord.MessageEmbed()
        .setTitle(`✅ Trade byl přijat!`)
        .setColor(`0xeb34cf`)
        .setDescription(`Trade s uživatelem ${user} byl dokončen`)
 
        var noo = new npmmodules.Discord.MessageEmbed()
        .setTitle(`❌ Trade byl odmítnut!`)
        .setColor(`0xeb34cf`)
        .setDescription(`Bohužel trade uživatel ${user} nepřijal..`)
 
        var accepted = new npmmodules.Discord.MessageEmbed()
            .setTitle(`Žádost o trade byla přijata`)
            .setColor(`0xeb34cf`)
            .setDescription(`➤ Nyní prosím doplň následující informace..`)
 
        message.inlineReply(`${user}, *${message.author.username}* ti zaslal žádost o trade. Chceš tuto žádost přijmout?\nJako odpověď napiš do chatu **\`ano\`** nebo **\`ne\`**`).then(async m => {
 
            message.channel.awaitMessages(async message => user.id === message.author.id,
                {max: 1, time: 60000}).then(async collected => {
                    //checking asnwers
                    if(collected.first().content.toLowerCase() == 'ano') {
                    message.channel.send(accepted).then(async msg => {
 
                        // ////////////////////////////////////////////////////////////////////////
                        // ////////////////////////////////////////////////////////////////////////
                        // ////////////////////////////////////////////////////////////////////////
                        // ////////////////////////////////////////////////////////////////////////
                    accepted.setTitle(`🔧 Nastavení Tradu`).setDescription(`${message.author}, co chceš nabídnout uživateli *${user}*?\n**Vyber jednu z možností:**\nPeníze z banky ➤ 🏦\nPeníze z peneženky ➤ 💰\nPředmět ➤ ⚒️`)
                    msg.edit(accepted).then(async msg => {
                        await msg.react('🏦').then(async () =>{
                            await msg.react('💰').then(async () =>{
                                await msg.react('⚒️')
 
                                    const bankFilter = (reaction, user) =>
                                    reaction.emoji.name === "🏦" && user.id === message.author.id;
                                    const walletFilter = (reaction, user) =>
                                    reaction.emoji.name === "💰" && user.id === message.author.id;
                                    const itemFilter = (reaction, user) =>
                                    reaction.emoji.name === "⚒️" && user.id === message.author.id;
 
                                    const bank = msg.createReactionCollector(bankFilter, {
                                        time: 60000,
                                        max: 1
                                        });
                                    const wallet = msg.createReactionCollector(walletFilter, {
                                        time: 60000,
                                        max: 1
                                        })
 
                                    const item = msg.createReactionCollector(itemFilter, {
                                        time: 60000,
                                        max: 1
                                        });
                                    
                                    // bank reaction
                                    bank.on("collect", async () => {
                                        wallet.stop()
                                        item.stop()
                                        var myAmount = 0
                                        var hisAmount = 0
 
                                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        accepted.setDescription(`${message.author}, nyní prosím zadej částku, kterou chceš uživateli přeposlat na jeho bankovní účet\n**Nastav počet peněz, které chceš vyměnit (uprav pomocí reakcí):**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`🏦 ${message.author.username}'s Bank`, `**Množství:** ${myAmount} ${config.discord.bot.currency}`)
                                        msg.edit(accepted)
 
                                        await msg.react('🔴').then(async () =>{
                                            await msg.react('🟠').then(async () =>{
                                                await msg.react('🟢').then(async () =>{
                                                    await msg.react('🔵').then(async () => {
                                                        await msg.react('📩')
 
                                                        const minus1000Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🔴" && user.id === message.author.id;
                                                        const minus100Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🟠" && user.id === message.author.id;
                                                        const plus100Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🟢" && user.id === message.author.id;
                                                        const plus1000Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🔵" && user.id === message.author.id;
                                                        const saveFilter = (reaction, user) =>
                                                        reaction.emoji.name === "📩" && user.id === message.author.id;
                        
                                                        const minus1000 = msg.createReactionCollector(minus1000Filter, {
                                                            time: 60000,
                                                            });
                                                        const minus100 = msg.createReactionCollector(minus100Filter, {
                                                            time: 60000
                                                            })
                    
                                                        const plus100 = msg.createReactionCollector(plus100Filter, {
                                                            time: 60000,
                                                            });
                                                        const plus1000 = msg.createReactionCollector(plus1000Filter, {
                                                            time: 60000
                                                            });
                                                        
                                                        const save = msg.createReactionCollector(saveFilter, {
                                                            time: 60000
                                                            });
 
                                                        minus1000.on('collect', async () => {
                                                            msg.reactions.resolve("🔴").users.remove(message.author.id);
 
                                                            if((myAmount - 1000) < 0) {
                                                                msg.reactions.resolve("🔴").users.remove(message.author.id);
                                                                myAmount = 0
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Bank`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            } else {
                                                                myAmount = myAmount - 1000
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Bank`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            }
                                                        })
 
                                                        plus1000.on('collect', async () => {
                                                            msg.reactions.resolve("🔵").users.remove(message.author.id);
 
                                                            if((myAmount + 1000) > userBank) {
                                                                msg.reactions.resolve("🔵").users.remove(message.author.id);
                                                            } else {
                                                                myAmount = myAmount + 1000
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Bank`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
    
                                                                msg.edit(accepted)
                                                            }
 
                                                        })
 
                                                        minus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟠").users.remove(message.author.id);
 
                                                            if((myAmount - 100) < 0) {
                                                                msg.reactions.resolve("🟠").users.remove(message.author.id);
                                                                
                                                            } else {
                                                                myAmount = myAmount - 100
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Bank`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            }
                                                            
                                                        })
 
                                                        plus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟢").users.remove(message.author.id);
 
                                                            if((myAmount + 100) > userBank) {
                                                                msg.reactions.resolve("🟢").users.remove(message.author.id);
 
                                                            } else {
                                                                myAmount = myAmount + 100
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Bank`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            }
                                                        })
                                                        
 
                                                        save.on('collect', async () => {
                                                            msg.reactions.resolve("📩").users.remove(message.author.id);
 
                                                            if(myAmount === 0) {
                                                                msg.reactions.resolve("📩").users.remove(message.author.id);
                                                            } else {
                                                                plus1000.stop()
                                                                minus1000.stop()
                                                                plus100.stop()
                                                                minus100.stop()
                                                                await msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                
                                                                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                await accepted.setTitle(`🔧 Nastavení Tradu`).setDescription(`${user}, co chceš nabídnout uživateli *${message.author}*?\n**Vyber jednu z možností:**\nPeníze z banky ➤ 🏦\nPeníze z peneženky ➤ 💰\nPředmět ➤ ⚒️`)
                                                                await msg.edit(accepted).then(async () => {
                                                                    await msg.react('🏦').then(async () =>{
                                                                        await msg.react('💰').then(async () =>{
                                                                            await msg.react('⚒️')
                                            
                                                                                const bankFilter2 = (reaction, user) =>
                                                                                reaction.emoji.name === "🏦" && user.id === user2.id;
                                                                                const walletFilter2 = (reaction, user) =>
                                                                                reaction.emoji.name === "💰" && user.id === user2.id;
                                                                                const itemFilter2 = (reaction, user) =>
                                                                                reaction.emoji.name === "⚒️" && user.id === user2.id;
                                            
                                                                                const bank2 = msg.createReactionCollector(bankFilter2, {
                                                                                    time: 60000,
                                                                                    max: 1
                                                                                    });
                                                                                const wallet2 = msg.createReactionCollector(walletFilter2, {
                                                                                    time: 60000,
                                                                                    max: 1
                                                                                    })
                                            
                                                                                const item2 = msg.createReactionCollector(itemFilter2, {
                                                                                    time: 60000,
                                                                                    max: 1
                                                                                    });
                                                                                
                                                                                // bank reaction
                                                                                bank2.on("collect", async () => {
                                                                                    wallet2.stop()
                                                                                    item2.stop()
                                                                                    var hisAmount = 0
                                            
                                                                                    msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                                    accepted.setDescription(`${user}, nyní prosím zadej částku, kterou chceš uživateli přeposlat na jeho bankovní účet\n**Nastav počet peněz, které chceš vyměnit (uprav pomocí reakcí):**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`🏦 ${user.username}'s Bank`, `**Množství:** ${hisAmount} ${config.discord.bot.currency}`)
                                                                                    msg.edit(accepted)
                                            
                                                                                    await msg.react('🔴').then(async () =>{
                                                                                        await msg.react('🟠').then(async () =>{
                                                                                            await msg.react('🟢').then(async () =>{
                                                                                                await msg.react('🔵').then(async () => {
                                                                                                    await msg.react('📩')
                                            
                                                                                                    const minus1000Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🔴" && user.id === user2.id;
                                                                                                    const minus100Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🟠" && user.id === user2.id;
                                                                                                    const plus100Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🟢" && user.id === user2.id;
                                                                                                    const plus1000Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🔵" && user.id === user2.id;
                                                                                                    const saveFilter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "📩" && user.id === user2.id;
                                                                    
                                                                                                    const minus10002 = msg.createReactionCollector(minus1000Filter2, {
                                                                                                        time: 60000,
                                                                                                        });
                                                                                                    const minus1002 = msg.createReactionCollector(minus100Filter2, {
                                                                                                        time: 60000
                                                                                                        })
                                                                
                                                                                                    const plus1002 = msg.createReactionCollector(plus100Filter2, {
                                                                                                        time: 60000,
                                                                                                        });
                                                                                                    const plus10002 = msg.createReactionCollector(plus1000Filter2, {
                                                                                                        time: 60000
                                                                                                        });
                                                                                                    
                                                                                                    const save2 = msg.createReactionCollector(saveFilter2, {
                                                                                                        time: 60000
                                                                                                        });
                                            
                                                                                                    minus10002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🔴").users.remove(user.id);
                                            
                                                                                                        if((hisAmount - 1000) < 0) {
                                                                                                            msg.reactions.resolve("🔴").users.remove(user.id);
                                                                                                            hisAmount = 0
                                                                                                            accepted.fields[1] = {name : `🏦 ${user.username}'s Bank`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount - 1000
                                                                                                            accepted.fields[1] = {name : `🏦 ${user.username}'s Bank`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                                                                                    })
                                            
                                                                                                    plus10002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🔵").users.remove(user.id);
                                            
                                                                                                        if((hisAmount + 1000) > hisBank) {
                                                                                                            msg.reactions.resolve("🔵").users.remove(user.id);
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount + 1000
                                                                                                            accepted.fields[1] = {name : `🏦 ${user.username}'s Bank`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                                
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                            
                                                                                                    })
                                            
                                                                                                    minus1002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🟠").users.remove(user.id);
                                            
                                                                                                        if((hisAmount - 100) < 0) {
                                                                                                            msg.reactions.resolve("🟠").users.remove(user.id);
                                                                                                            
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount - 100
                                                                                                            accepted.fields[1] = {name : `🏦 ${user.username}'s Bank`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                                                                                        
                                                                                                    })
                                            
                                                                                                    plus1002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🟢").users.remove(user.id);
                                            
                                                                                                        if((hisAmount + 100) > hisBank) {
                                                                                                            msg.reactions.resolve("🟢").users.remove(user.id);
                                            
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount + 100
                                                                                                            accepted.fields[1] = {name : `🏦 ${user.username}'s Bank`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                                                                                    })
                                                                                                    
                                            
                                                                                                    save2.on('collect', async () => {
                                                                                                        msg.reactions.resolve("📩").users.remove(user.id);
                                            
                                                                                                        if(hisAmount === 0) {
                                                                                                            msg.reactions.resolve("📩").users.remove(user.id);
                                                                                                        } else {
                                                                                                            plus1000.stop()
                                                                                                            minus1000.stop()
                                                                                                            plus100.stop()
                                                                                                            minus100.stop()
                                                                                                            msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                                                            
                                                                                                            message.channel.send(`${message.author}, chceš přijmout tento trade?`).then(async mess => {
                                                                                                                await mess.react('✅').then(async () => {
                                                                                                                    await mess.react('❌')
 
                                                                                                                    const yesFilter = (reaction, user) =>
                                                                                                                    reaction.emoji.name === "✅" && user.id === message.author.id;
                                                                                                                    const noFilter = (reaction, user) =>
                                                                                                                    reaction.emoji.name === "❌" && user.id === message.author.id;
                                                                                
                                                                                                                    const yes2 = mess.createReactionCollector(yesFilter, {
                                                                                                                        time: 60000,
                                                                                                                        max: 1
                                                                                                                        });
                                                                                                                    const no2 = mess.createReactionCollector(noFilter, {
                                                                                                                        time: 60000,
                                                                                                                        max: 1
                                                                                                                        })
 
                                                                                                                    yes2.on('collect', async () => {                                                                                                                        
                                                                                                                        
                                                                                                                        await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user2.id}, {$set: {bank: (hisBank - hisAmount) + myAmount, total: (hisTotal - hisAmount) + myAmount}})
                                                                                                                        await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {bank: (userBank - myAmount) + hisAmount, total: (userTotal - myAmount) + hisAmount}})
                                                                                                                        
                                                                                                                        
                                                                                                                        msg.delete()
                                                                                                                        mess.delete()
                                                                                                                        accepted.setDescription('Jako poslední krok musíš přijmout trade')
 
                                                                                                                        return message.channel.send(yess)
                                                                                                                        
                                                                                                                    })
                                                                                                                    no2.on('collect', async () => {
                                                                                                                        msg.delete()
                                                                                                                        mess.delete()
                                                                                                                        return message.channel.send(noo)
                                                                                                                    })
                                                                                                                })
                                                                                                            })
                                                                                                            /////////////////////
                                                                                                        }
                                                                                                        
                                                                                                    })
                                            
                                                                                                    })
                                                         
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                })
                                            
                                                                                // wallet reaction
                                                                                wallet2.on("collect", async () => {
                                                                                    bank2.stop()
                                                                                    item2.stop()
                                                                                    var hisAmount = 0
                                            
                                                                                    msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                                    accepted.setDescription(`${user}, nyní si můžeš z peněženky vytáhnout tolik peněz, kolik chceš darovat.\n**Nastav počet peněz, které chceš vyměnit (uprav pomocí reakcí):**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`💰 ${user.username}'s Wallet`, `**Množství:** ${hisAmount} ${config.discord.bot.currency}`)
                                                                                    msg.edit(accepted)
                                            
                                                                                    await msg.react('🔴').then(async () =>{
                                                                                        await msg.react('🟠').then(async () =>{
                                                                                            await msg.react('🟢').then(async () =>{
                                                                                                await msg.react('🔵').then(async () => {
                                                                                                    await msg.react('📩')
                                            
                                                                                                    const minus1000Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🔴" && user.id === user2.id;
                                                                                                    const minus100Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🟠" && user.id === user2.id;
                                                                                                    const plus100Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🟢" && user.id === user2.id;
                                                                                                    const plus1000Filter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "🔵" && user.id === user2.id;
                                                                                                    const saveFilter2 = (reaction, user) =>
                                                                                                    reaction.emoji.name === "📩" && user.id === user2.id;
                                                                    
                                                                                                    const minus10002 = msg.createReactionCollector(minus1000Filter2, {
                                                                                                        time: 60000,
                                                                                                        });
                                                                                                    
                                                                                                    const minus1002 = msg.createReactionCollector(minus100Filter2, {
                                                                                                        time: 60000
                                                                                                        })
                                                                
                                                                                                    const plus1002 = msg.createReactionCollector(plus100Filter2, {
                                                                                                        time: 60000,
                                                                                                        });
                                                                                                    const plus10002 = msg.createReactionCollector(plus1000Filter2, {
                                                                                                        time: 60000
                                                                                                        });
                                                                                                    
                                                                                                    const save2 = msg.createReactionCollector(saveFilter2, {
                                                                                                        time: 60000
                                                                                                        });
                                            
                                                                                                    minus10002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🔴").users.remove(user.id);
                                            
                                                                                                        if((hisAmount - 1000) < 0) {
                                                                                                            msg.reactions.resolve("🔴").users.remove(user.id);
                                                                                                            hisAmount = 0
                                                                                                            accepted.fields[1] = {name : `💰 ${user.username}'s Wallet`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount - 1000
                                                                                                            accepted.fields[1] = {name : `💰 ${user.username}'s Wallet`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                                                                                    })
                                            
                                                                                                    plus10002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🔵").users.remove(user.id);
                                            
                                                                                                        if((hisAmount + 1000) > hisBal) {
                                                                                                            msg.reactions.resolve("🔵").users.remove(user.id);
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount + 1000
                                                                                                            accepted.fields[1] = {name : `💰 ${user.username}'s Wallet`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                                
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                            
                                                                                                    })
                                            
                                                                                                    minus1002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🟠").users.remove(user.id);
                                            
                                                                                                        if((hisAmount - 100) < 0) {
                                                                                                            msg.reactions.resolve("🟠").users.remove(user.id);
                                                                                                            
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount - 100
                                                                                                            accepted.fields[1] = {name : `💰 ${user.username}'s Wallet`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                                                                                        
                                                                                                    })
                                            
                                                                                                    plus1002.on('collect', async () => {
                                                                                                        msg.reactions.resolve("🟢").users.remove(user.id);
                                            
                                                                                                        if((hisAmount + 100) > hisBal) {
                                                                                                            msg.reactions.resolve("🟢").users.remove(user.id);
                                            
                                                                                                        } else {
                                                                                                            hisAmount = hisAmount + 100
                                                                                                            accepted.fields[1] = {name : `💰 ${user.username}'s Wallet`, value : `**Množství:** ${hisAmount} ${config.discord.bot.currency}`}
                                            
                                                                                                            msg.edit(accepted)
                                                                                                        }
                                                                                                    })
                                                                                                    
                                            
                                                                                                    save2.on('collect', async () => {
                                                                                                        msg.reactions.resolve("📩").users.remove(user.id);
                                            
                                                                                                        if(hisAmount === 0) {
                                                                                                            msg.reactions.resolve("📩").users.remove(user.id);
                                                                                                        } else {
                                                                                                            plus1000.stop()
                                                                                                            minus1000.stop()
                                                                                                            plus100.stop()
                                                                                                            minus100.stop()
                                                                                                            msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                                                            message.channel.send(`${message.author}, chceš přijmout tento trade?`).then(async mess => {
                                                                                                                await mess.react('✅').then(async () => {
                                                                                                                    await mess.react('❌')
 
                                                                                                                    const yesFilter = (reaction, user) =>
                                                                                                                    reaction.emoji.name === "✅" && user.id === message.author.id;
                                                                                                                    const noFilter = (reaction, user) =>
                                                                                                                    reaction.emoji.name === "❌" && user.id === message.author.id;
                                                                                
                                                                                                                    const yes2 = mess.createReactionCollector(yesFilter, {
                                                                                                                        time: 60000,
                                                                                                                        max: 1
                                                                                                                        });
                                                                                                                    const no2 = mess.createReactionCollector(noFilter, {
                                                                                                                        time: 60000,
                                                                                                                        max: 1
                                                                                                                        })
 
                                                                                                                    yes2.on('collect', async () => {
                                                                                                                        await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user2.id}, {$set: {bank: hisBank + myAmount, wallet: hisBal - hisAmount, total: (hisTotal - hisAmount) + myAmount}})
                                                                                                                        await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {wallet: bal + hisAmount, bank: userBank - myAmount, total: (userTotal - myAmount) + hisAmount}})
 
                                                                                                                        msg.delete()
                                                                                                                        mess.delete()
                                                                                                                        accepted.setDescription('Jako poslední krok musíš přijmout trade')
                                                                                                                        return message.channel.send(yess)
                                                                                                                    })
                                                                                                                    no2.on('collect', async () => {
                                                                                                                        msg.delete()
                                                                                                                        mess.delete()
                                                                                                                        return message.channel.send(noo)
                                                                                                                    })
                                                                                                                })
                                                                                                            })
                                                                                                        }
                                                                                                        
                                                                                                    })
                                            
                                        
                                                                                                    })
                                                         
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                })
                                            
                                                                                // item reaction
                                                                                item2.on("collect", async () => {
                                                                                    wallet2.stop()
                                                                                    bank2.stop()
                                                                                        var string2 = ``
                                                                                        var pickTwoAmount2 = 0
                                                                                        var pickThreeAmount2 = 0
                                                                                        var pickFourAmount2 = 0
                                                                                        var pickFiveAmount2 = 0
                                                                                        var selectedPick = 0
                                                                                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                            
                                                                                        Object.keys(hisInventory).forEach(ownedItem => {
                                                                                            if(hisInventory[ownedItem] === 0) return
                                                                            
                                                                                        var itemInfo = config.discord.economy[ownedItem]
                                                                                        if(itemInfo.id < 11) return
                                                                                            string2 += `${itemInfo.itemName} ➤ ${itemInfo.tradeEmoji}\n`
                                                                                        })
                                            
                                                                                        accepted.setDescription(`${user} ale ale, pán je tu dealer! Jaký předmět bys tak uživateli ${message.author} nabídnul?\n\n**Vyber si předmět, který chceš nabídnout, podle ID (pokud chceš tedy nabídnout například Železný Krumpáč, zareaguj číslem 2 - protože má ID 12):**\n${string2}`)
                                                                                        msg.edit(accepted)
                                                                                        
                                                                                        await msg.react('2️⃣').then(async () =>{
                                                                                            await msg.react('3️⃣').then(async () =>{
                                                                                                await msg.react('4️⃣').then(async () =>{
                                                                                                    await msg.react('5️⃣').then(async () =>{
                                                                                                        await msg.react('📩')
                                                                                                    
                                                
                                                                                                        const twoFilter2 = (reaction, user) =>
                                                                                                        reaction.emoji.name === "2️⃣" && user.id === user2.id;
                                                                                                        const threeFilter2 = (reaction, user) =>
                                                                                                        reaction.emoji.name === "3️⃣" && user.id === user2.id;
                                                                                                        const fourFilter2 = (reaction, user) =>
                                                                                                        reaction.emoji.name === "4️⃣" && user.id === user2.id;
                                                                                                        const fiveFilter2 = (reaction, user) =>
                                                                                                        reaction.emoji.name === "5️⃣" && user.id === user2.id;
                                                                                                        const saveFilter2 = (reaction, user) =>
                                                                                                        reaction.emoji.name === "📩" && user.id === user2.id;
                                                                        
                                                                                                        const two2 = msg.createReactionCollector(twoFilter2, {
                                                                                                            time: 60000
                                                                                                            });
                                                                                                        const three2 = msg.createReactionCollector(threeFilter2, {
                                                                                                            time: 60000
                                                                                                            })
                                                                    
                                                                                                        const four2 = msg.createReactionCollector(fourFilter2, {
                                                                                                            time: 60000
                                                                                                            });
                                                                                                        const five2 = msg.createReactionCollector(fiveFilter2, {
                                                                                                            time: 60000
                                                                                                            });
                                            
                                                                                                        const save2 = msg.createReactionCollector(saveFilter2, {
                                                                                                                time: 60000
                                                                                                            });
                                                
                                                                                                        
                                                                                                        two2.on('collect', async () => {
                                                                                                            msg.reactions.resolve("2️⃣").users.remove(user.id);
                                                                                                            Object.keys(hisInventory).forEach(ownedItem => {
                                                                                                                var itemInfo = config.discord.economy[ownedItem]
                                                                                                                if(itemInfo.id === 12 && pickTwoAmount2 === 0) {
                                                                                                                    pickTwoAmount2 = 1
                                                                                                                    pickThreeAmount2, pickFiveAmount2, pickFourAmount2 = 0
                                                                                                                    accepted.fields[1] = {name: `${user.username}'s Offer`, value: `**${pickTwoAmount2}x** ${itemInfo.itemName} ${itemInfo.emoji}`}
                                                                                                                    msg.edit(accepted)
                                                                                                            
                                                                                                                } else {
                                                                                                                    return
                                                                                                                }
                                                                                                            })
                                                                                                            
                                                                                                        })
                                                                                                        
                                                                                                        three2.on('collect', async () => {
                                                                                                            msg.reactions.resolve("3️⃣").users.remove(user.id);
                                                                                                            Object.keys(hisInventory).forEach(ownedItem => {
                                                                                                                var itemInfo = config.discord.economy[ownedItem]
                                                                                                                if(itemInfo.id === 13 && pickThreeAmount2 === 0) {
                                                                                                                    pickThreeAmount2 = 1
                                                                                                                    pickTwoAmount2, pickFiveAmount2, pickFourAmount2 = 0
                                                                                                                    accepted.fields[1] = {name: `${user.username}'s Offer`, value: `**${pickThreeAmount2}x** ${itemInfo.itemName} ${itemInfo.emoji}`}
                                                                                                                    msg.edit(accepted)
                                                                                                                    
                                                                                                                } else {
                                                                                                                    return
                                                                                                                }
                                                                                                            })
                                                                                                        })
                                            
                                                                                                        four2.on('collect', async () => {
                                                                                                            msg.reactions.resolve("4️⃣").users.remove(user.id);
                                                                                                            Object.keys(hisInventory).forEach(ownedItem => {
                                                                                                                var itemInfo = config.discord.economy[ownedItem]
                                                                                                                if(itemInfo.id === 14 && pickFourAmount2 === 0) {
                                                                                                                    pickFourAmount2 = 1
                                                                                                                    pickThreeAmount2, pickTwoAmount2, pickFiveAmount2 = 0
                                                                                                                    accepted.fields[1] = {name: `${user.username}'s Offer`, value: `**${pickFourAmount2}x** ${itemInfo.itemName} ${itemInfo.emoji}`}
                                                                                                                    msg.edit(accepted)
                                                                                                                    
                                                                                                                } else {
                                                                                                                    return
                                                                                                                }
                                                                                                            })
                                                                                                        })
                                            
                                                                                                        five2.on('collect', async () => {
                                                                                                            msg.reactions.resolve("5️⃣").users.remove(user.id);
                                                                                                            Object.keys(hisInventory).forEach(ownedItem => {
                                                                                                                var itemInfo = config.discord.economy[ownedItem]
                                                                                                                if(itemInfo.id === 15 && pickFiveAmount2 === 0) {
                                                                                                                    pickFiveAmount2 = 1
                                                                                                                    pickThreeAmount2, pickTwoAmount2, pickFourAmount2 = 0
                                                                                                                    accepted.fields[1] = {name: `${user.username}'s Offer`, value: `**${pickFiveAmount2}x** ${itemInfo.itemName} ${itemInfo.emoji}`}
                                                                                                                    msg.edit(accepted)
                                                                                                                    
                                                                                                                } else {
                                                                                                                    return
                                                                                                                }
                                                                                                            })
                                                                                                        })
                                            
                                                                                                        save2.on('collect', async () => {
                                                                                                            msg.reactions.resolve("📩").users.remove(user.id);
                                            
                                                                                                            if(pickFiveAmount2 === 0 && pickFourAmount2 === 0 && pickThreeAmount2 === 0 && pickTwoAmount2 === 0) {
                                                                                                                msg.reactions.resolve("📩").users.remove(user.id);
                                                                                                            } else {
 
                                                                                                                if(pickTwoAmount2 === 1) {
                                                                                                                    selectedPick = 12
                                                                                                                } else if(pickThreeAmount2 === 1) {
                                                                                                                    selectedPick = 13
                                                                                                                } else if(pickFiveAmount2 === 1) {
                                                                                                                    selectedPick = 14
                                                                                                                } else if(pickFiveAmount2 === 1) {
                                                                                                                    selectedPick = 15
                                                                                                                } else return console.log(selectedPick)
 
                                                                                                            msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                                                            message.channel.send(`${message.author}, chceš přijmout tento trade?`).then(async mess => {
                                                                                                                await mess.react('✅').then(async () => {
                                                                                                                    await mess.react('❌')
 
                                                                                                                    const yesFilter = (reaction, user) =>
                                                                                                                    reaction.emoji.name === "✅" && user.id === message.author.id;
                                                                                                                    const noFilter = (reaction, user) =>
                                                                                                                    reaction.emoji.name === "❌" && user.id === message.author.id;
                                                                                
                                                                                                                    const yes2 = mess.createReactionCollector(yesFilter, {
                                                                                                                        time: 60000,
                                                                                                                        max: 1
                                                                                                                        });
                                                                                                                    const no2 = mess.createReactionCollector(noFilter, {
                                                                                                                        time: 60000,
                                                                                                                        max: 1
                                                                                                                        })
 
                                                                                                                    yes2.on('collect', async () => {
                                                                                                                        two2.stop()
                                                                                                                        three2.stop()
                                                                                                                        four2.stop()
                                                                                                                        five2.stop()
 
                                                                                                                        await modules.mongodb.collections.inventory.insertOne({user_id: user2.id, item_id: selectedPick, count: 1 * -1})
                                                                                                                        await modules.mongodb.collections.inventory.insertOne({user_id: message.author.id, item_id: selectedPick, count: 1})
                                                                                                                        await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user2.id}, {$set: {bank: hisBank + myAmount, total: hisTotal + myAmount}})
                                                                                                                        await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {bank: userBank - myAmount, total: userTotal - myAmount}})
                                                                                                                        msg.delete()
                                                                                                                        mess.delete()
                                                                                                                        
                                                                                                                        return message.channel.send(yess)
                                                                                                                    })
                                                                                                                    no2.on('collect', async () => {
                                                                                                                        msg.delete()
                                                                                                                        mess.delete()
                                                                                                                        return message.channel.send(noo)
                                                                                                                    })
                                                                                                                })
                                                                                                            })
                                                                                                            }
                                                                                                        })
                                            
                                                                                                        })
                                                                                                    })
                                                             
                                                                                            })
                                                                                                
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                            
                                                                    })
           /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                            }
                                                            
                                                        })
 
                                                        })
             
                                                    })
                                                })
                                            })
                                    })
 
                                    // wallet reaction
                                    wallet.on("collect", async () => {
                                        item.stop()
                                        bank.stop()
                                        var myAmount = 0
 
                                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        accepted.setDescription(`${message.author}, nyní si můžeš z peněženky vytáhnout tolik peněz, kolik chceš darovat.\n**Nastav počet peněz, které chceš vyměnit (uprav pomocí reakcí):**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`🏦 ${message.author.username}'s Wallet`, `**Množství:** ${myAmount} ${config.discord.bot.currency}`)
                                        msg.edit(accepted)
 
                                        await msg.react('🔴').then(async () =>{
                                            await msg.react('🟠').then(async () =>{
                                                await msg.react('🟢').then(async () =>{
                                                    await msg.react('🔵').then(async () => {
                                                        await msg.react('📩')
 
                                                        const minus1000Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🔴" && user.id === message.author.id;
                                                        const minus100Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🟠" && user.id === message.author.id;
                                                        const plus100Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🟢" && user.id === message.author.id;
                                                        const plus1000Filter = (reaction, user) =>
                                                        reaction.emoji.name === "🔵" && user.id === message.author.id;
                                                        const saveFilter = (reaction, user) =>
                                                        reaction.emoji.name === "📩" && user.id === message.author.id;
                        
                                                        const minus1000 = msg.createReactionCollector(minus1000Filter, {
                                                            time: 60000,
                                                            });
                                                        
                                                        const minus100 = msg.createReactionCollector(minus100Filter, {
                                                            time: 60000
                                                            })
                    
                                                        const plus100 = msg.createReactionCollector(plus100Filter, {
                                                            time: 60000,
                                                            });
                                                        const plus1000 = msg.createReactionCollector(plus1000Filter, {
                                                            time: 60000
                                                            });
                                                        
                                                        const save = msg.createReactionCollector(saveFilter, {
                                                            time: 60000
                                                            });
 
                                                        minus1000.on('collect', async () => {
                                                            msg.reactions.resolve("🔴").users.remove(message.author.id);
 
                                                            if((myAmount - 1000) < 0) {
                                                                msg.reactions.resolve("🔴").users.remove(message.author.id);
                                                                myAmount = 0
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Wallet`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            } else {
                                                                myAmount = myAmount - 1000
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Wallet`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            }
                                                        })
 
                                                        plus1000.on('collect', async () => {
                                                            msg.reactions.resolve("🔵").users.remove(message.author.id);
 
                                                            if((myAmount + 1000) > bal) {
                                                                msg.reactions.resolve("🔵").users.remove(message.author.id);
                                                            } else {
                                                                myAmount = myAmount + 1000
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Wallet`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
    
                                                                msg.edit(accepted)
                                                            }
 
                                                        })
 
                                                        minus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟠").users.remove(message.author.id);
 
                                                            if((myAmount - 100) < 0) {
                                                                msg.reactions.resolve("🟠").users.remove(message.author.id);
                                                                
                                                            } else {
                                                                myAmount = myAmount - 100
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Wallet`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            }
                                                            
                                                        })
 
                                                        plus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟢").users.remove(message.author.id);
 
                                                            if((myAmount + 100) > bal) {
                                                                msg.reactions.resolve("🟢").users.remove(message.author.id);
 
                                                            } else {
                                                                myAmount = myAmount + 100
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Wallet`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
 
                                                                msg.edit(accepted)
                                                            }
                                                        })
                                                        
 
                                                        save.on('collect', async () => {
                                                            msg.reactions.resolve("📩").users.remove(message.author.id);
 
                                                            if(myAmount === 0) {
                                                                msg.reactions.resolve("📩").users.remove(message.author.id);
                                                            } else {
                                                                plus1000.stop()
                                                                minus1000.stop()
                                                                plus100.stop()
                                                                minus100.stop()
                                                                msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                message.channel.send('saved')
                                                            }
                                                            
                                                        })
 
 
                                                        // end of wallet selection
                                                        })
             
                                                    })
                                                })
                                            })
                                    })
 
                                    // item reaction
                                    item.on("collect", async () => {
                                        wallet.stop()
                                        bank.stop()
                                            var string = ``
                                            var pickTwoAmount = 0
                                            var pickThreeAmount = 0
                                            var pickFourAmount = 0
                                            var pickFiveAmount = 0
                                            msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
 
                                            Object.keys(myInventory).forEach(ownedItem => {
                                                if(myInventory[ownedItem] === 0) return
                                
                                            var itemInfo = config.discord.economy[ownedItem]
                                            if(itemInfo.id < 11) return
                                                string += `${itemInfo.itemName} ➤ ${itemInfo.tradeEmoji}\n`
                                            })
 
                                            accepted.setDescription(`${message.author} ale ale, pán je tu dealer! Jaký předmět bys tak uživateli ${user} nabídnul?\n\n**Vyber si předmět, který chceš nabídnout, podle ID (pokud chceš tedy nabídnout například Železný Krumpáč, zareaguj číslem 2 - protože má ID 12):**\n${string}`)
                                            msg.edit(accepted)
                                            
                                            await msg.react('2️⃣').then(async () =>{
                                                await msg.react('3️⃣').then(async () =>{
                                                    await msg.react('4️⃣').then(async () =>{
                                                        await msg.react('5️⃣').then(async () =>{
                                                            await msg.react('📩')
                                                        
    
                                                            const twoFilter = (reaction, user) =>
                                                            reaction.emoji.name === "2️⃣" && user.id === message.author.id;
                                                            const threeFilter = (reaction, user) =>
                                                            reaction.emoji.name === "3️⃣" && user.id === message.author.id;
                                                            const fourFilter = (reaction, user) =>
                                                            reaction.emoji.name === "4️⃣" && user.id === message.author.id;
                                                            const fiveFilter = (reaction, user) =>
                                                            reaction.emoji.name === "5️⃣" && user.id === message.author.id;
                                                            const saveFilter = (reaction, user) =>
                                                            reaction.emoji.name === "📩" && user.id === message.author.id;
                            
                                                            const two = msg.createReactionCollector(twoFilter, {
                                                                time: 60000
                                                                });
                                                            const three = msg.createReactionCollector(threeFilter, {
                                                                time: 60000
                                                                })
                        
                                                            const four = msg.createReactionCollector(fourFilter, {
                                                                time: 60000
                                                                });
                                                            const five = msg.createReactionCollector(fiveFilter, {
                                                                time: 60000
                                                                });
 
                                                            const save = msg.createReactionCollector(saveFilter, {
                                                                    time: 60000
                                                                });
    
                                                            
                                                            two.on('collect', async () => {
                                                                msg.reactions.resolve("2️⃣").users.remove(message.author.id);
                                                                Object.keys(myInventory).forEach(ownedItem => {
                                                                    var itemInfo = config.discord.economy[ownedItem]
                                                                    if(itemInfo.id === 12 && pickTwoAmount === 0) {
                                                                        pickTwoAmount = 1
                                                                        accepted.fields = []
                                                                        pickThreeAmount, pickFiveAmount, pickFourAmount = 0
                                                                        accepted.addField(`${message.author.username}'s Offer`, `**${pickTwoAmount}x** ${itemInfo.itemName} ${itemInfo.emoji}`)
                                                                        msg.edit(accepted)
                                                                    } else return
                                                                })
                                                                
                                                            })
                                                            
                                                            three.on('collect', async () => {
                                                                msg.reactions.resolve("3️⃣").users.remove(message.author.id);
                                                                Object.keys(myInventory).forEach(ownedItem => {
                                                                    var itemInfo = config.discord.economy[ownedItem]
                                                                    if(itemInfo.id === 13 && pickThreeAmount === 0) {
                                                                        pickThreeAmount = 1
                                                                        accepted.fields = []
                                                                        pickTwoAmount, pickFiveAmount, pickFourAmount = 0
                                                                        accepted.addField(`${message.author.username}'s Offer`, `**${pickThreeAmount}x** ${itemInfo.itemName} ${itemInfo.emoji}`)
                                                                        msg.edit(accepted)
                                                                    } else return
                                                                })
                                                            })
 
                                                            four.on('collect', async () => {
                                                                msg.reactions.resolve("4️⃣").users.remove(message.author.id);
                                                                Object.keys(myInventory).forEach(ownedItem => {
                                                                    var itemInfo = config.discord.economy[ownedItem]
                                                                    if(itemInfo.id === 14 && pickFourAmount === 0) {
                                                                        pickFourAmount = 1
                                                                        accepted.fields = []
                                                                        pickThreeAmount, pickFiveAmount, pickTwoAmount = 0
                                                                        accepted.addField(`${message.author.username}'s Offer`, `**${pickFourAmount}x** ${itemInfo.itemName} ${itemInfo.emoji}`)
                                                                        msg.edit(accepted)
                                                                    } else return
                                                                })
                                                            })
 
                                                            five.on('collect', async () => {
                                                                msg.reactions.resolve("5️⃣").users.remove(message.author.id);
                                                                Object.keys(myInventory).forEach(ownedItem => {
                                                                    var itemInfo = config.discord.economy[ownedItem]
                                                                    if(itemInfo.id === 15 && pickFiveAmount === 0) {
                                                                        pickFiveAmount = 1
                                                                        accepted.fields = []
                                                                        pickThreeAmount, pickTwoAmount, pickFourAmount = 0
                                                                        accepted.addField(`${message.author.username}'s Offer`, `**${pickFiveAmount}x** ${itemInfo.itemName} ${itemInfo.emoji}`)
                                                                        msg.edit(accepted)
                                                                    } else return
                                                                })
                                                            })
 
                                                            save.on('collect', async () => {
                                                                msg.reactions.resolve("📩").users.remove(message.author.id);
 
                                                                if(pickFiveAmount === 0 && pickFourAmount === 0 && pickThreeAmount === 0 && pickTwoAmount === 0) {
                                                                    msg.reactions.resolve("📩").users.remove(message.author.id);
                                                                } else {
                                                                    two.stop()
                                                                    three.stop()
                                                                    four.stop()
                                                                    five.stop()
                                                                    msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                                    message.channel.send('saved')
                                                                }
                                                            })
 
                                                            })
                                                        })
                 
                                                })
                                                    
                                    })
                                })
                            })
                        })
 
                        })
                        // ////////////////////////////////////////////////////////////////////////
                        // ////////////////////////////////////////////////////////////////////////
                        // ////////////////////////////////////////////////////////////////////////
                    
                    })
    
                    } else if(collected.first().content.toLowerCase() == 'ne') {
                        db.set(`tradeTimeout_${message.guild.id}_${message.author.id}`, Date.now());
                        return message.channel.send(discordEmbeds.warning(`Trade nebyl přijat`, `${user} nepřijal vaši žádost o trade. Bohužel se nic nedá dělat, budete muset najít jiného vandala`))
                    } else {
                        return message.channel.send(discordEmbeds.warning(`Chyba`, `Nespravná odpověď. Zkus to prosím znovu`))
                    }
    
            }).catch(async () => {
                m.delete()
                db.set(`tradeTimeout_${message.guild.id}_${message.author.id}`, Date.now());
                return message.channel.send(discordEmbeds.warning(`Chyba`, `Vypršel čas na odpověď! Zkus to později`))
            })
        })
 
 
    }
}
 
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
