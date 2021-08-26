var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require("../config.json")

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["give"],
    execute: async function(message, databaseUser) {

        var db = require('quick.db')
        let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
            }
            if(rob2 === "True") return


        if(!message.member.hasPermission("ADMINISTRATOR")) return message.inlineReply("Na tohle nemáš oprávnění..")

        if(!message.guild.me.hasPermission("ADD_REACTIONS")) return message.inlineReply("I do not have the permission to add reactions.")

        // argument conditions
        if(!message.args[1]) {
            return message.channel.send(discordEmbeds.warning('Pozor', `Nesprávný formát příkazu!\nPoužití \`${config.discord.bot.prefix}trade [member]\``)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        }

        var user = message.mentions.users.first()

        if(!user) return message.channel.send(discordEmbeds.warning(`Chyba`, `Omlouvám se, ale tohoto uživatele jsem nenašel..\nPoužití \`${config.discord.bot.prefix}trade \`**\`[member]\`**\``)).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })

        if(user.bot) return message.channel.send(discordEmbeds.warning(`Pozor`, `Boti nejsou součástí ekonomiky!`)).then(m => {
            m.delete({timeout: 10000})
            message.delete({timeout: 10000})
        })

        //my bal
        const economy = await modules.mongodb.collections.economy.find({user_id: user.id}).toArray()

        var userBal = 0
        var userBank = 0
        var userTotal = 0

        var economyList = {}

        economy.forEach(data => {
            userBal = parseInt(data.wallet)
            userBank = parseInt(data.bank)
            userTotal = parseInt(data.total)
            economyList = data
        });


        if(isEmpty(economyList) === true) {
            await modules.mongodb.collections.economy.insertOne({user_id: user.id, wallet: 0, bank: 0, total: 0})
        }

        var accepted = new npmmodules.Discord.MessageEmbed()
            .setTitle(`:wrench: ADMIN SETTINGS`)
            .setColor(`0xeb34cf`)
            .setDescription(``)

            await message.inlineReply(accepted).then(async msg => {
                    await accepted.setTitle(`🔧 ADMIN SETTINGS`).setDescription(`${message.author}, **vyber prosím jednu z možností. Pokud chcete uživateli nastavit nějaký určitý počet, zareagujte mobilem a poté znovu vyberte možnost banky nebo peněźenky.**\nPeníze do banky ➤ 🏦\nPeníze do peneženky ➤ 💰\nNastavit dle počtu ➤ 📲`)
                    await msg.edit(accepted).then(async msg => {
                        await msg.react('🏦').then(async () =>{
                            await msg.react('💰').then(async () =>{
                                await msg.react('📲').then(async () =>{

                                    const bankFilter = (reaction, user) =>
                                    reaction.emoji.name === "🏦" && user.id === message.author.id;
                                    const walletFilter = (reaction, user) =>
                                    reaction.emoji.name === "💰" && user.id === message.author.id;
                                    const setFilter = (reaction, user) =>
                                    reaction.emoji.name === "📲" && user.id === message.author.id;

                                    const bank = msg.createReactionCollector(bankFilter, {
                                        time: 60000,
                                        max: 1
                                        });
                                    const wallet = msg.createReactionCollector(walletFilter, {
                                        time: 60000,
                                        max: 1
                                        })
                                    const setAmount = msg.createReactionCollector(setFilter, {
                                        time: 60000,
                                        max: 1
                                        })

                                    
                                    // bank reaction
                                    bank.on("collect", async () => {
                                        var myAmount = 0
                                        var hisAmount = 0

                                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        accepted.setDescription(`${message.author}, **nyní prosím zadej částku, kterou chceš uživateli darovat:**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`🏦 ${message.author.username}'s Offer`, `**Množství:** ${myAmount} ${config.discord.bot.currency}`)
                                        await msg.edit(accepted)

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

                                                                myAmount = myAmount - 1000
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}

                                                                msg.edit(accepted)
                                                            
                                                        })

                                                        plus1000.on('collect', async () => {
                                                            msg.reactions.resolve("🔵").users.remove(message.author.id);

                                                            if((myAmount + 1000) > 999999999) {
                                                                msg.reactions.resolve("🔵").users.remove(message.author.id);
                                                            } else {
                                                                myAmount = myAmount + 1000
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
    
                                                                msg.edit(accepted)
                                                            }

                                                        })

                                                        minus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟠").users.remove(message.author.id);

                                                                myAmount = myAmount - 100
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}

                                                                msg.edit(accepted)
                                                            
                                                        })

                                                        plus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟢").users.remove(message.author.id);

                                                            if((myAmount + 100) > 999999999) {
                                                                msg.reactions.resolve("🟢").users.remove(message.author.id);

                                                            } else {
                                                                myAmount = myAmount + 100
                                                                accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}

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
                                                                
                                                                await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user.id}, {$set: {bank: userBank + myAmount, total: userTotal + myAmount}})
                                                                accepted.setDescription(`Úspěšně bylo darováno **${myAmount}** ${config.discord.bot.currency} do banky uživatele ${user}`)
                                                                msg.edit(accepted)
                                                            }
                                                            
                                                        })

                                                        })
             
                                                    })
                                                })
                                            })
                                    })

                                    // set reaction
                                    setAmount.on("collect", async () => {
                                        bank.stop()
                                        wallet.stop()
                                        setAmount.stop()

                                        await msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        await accepted.setTitle(`🔧 ADMIN SETTINGS`).setDescription(`${message.author}, **vyber jednu z možností** (určením čísla resetuješ číslo předešlé a nastavíš na nové):\nPeníze do banky ➤ 🏦\nPeníze do peneženky ➤ 💰`)
                                        await msg.edit(accepted).then(async msg => {
                                            await msg.react('🏦').then(async () =>{
                                                await msg.react('💰').then(async () =>{
                    
                                                        const bankFilterr = (reaction, user) =>
                                                        reaction.emoji.name === "🏦" && user.id === message.author.id;
                                                        const walletFilterr = (reaction, user) =>
                                                        reaction.emoji.name === "💰" && user.id === message.author.id;
                    
                                                        const bankk = msg.createReactionCollector(bankFilterr, {
                                                            time: 60000,
                                                            max: 1
                                                            });
                                                        const wallett = msg.createReactionCollector(walletFilterr, {
                                                            time: 60000,
                                                            max: 1
                                                            })
                    
                                                        
                                                        // bank reaction
                                                        bankk.on("collect", async () => {
                                                            var myAmount = 0
                                                            var hisAmount = 0
                    
                                                            await msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                            accepted.setDescription(`${message.author}, **nyní prosím zadej částku, kterou chceš uživateli nastavit:**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`🏦 ${message.author.username}'s Offer`, `**Množství:** ${myAmount} ${config.discord.bot.currency}`)
                                                            await msg.edit(accepted)
                    
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
                                                                                    accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                } else {
                                                                                    myAmount = myAmount - 1000
                                                                                    accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                }
                                                                            })
                    
                                                                            plus1000.on('collect', async () => {
                                                                                msg.reactions.resolve("🔵").users.remove(message.author.id);
                    
                                                                                if((myAmount + 1000) > 999999999) {
                                                                                    msg.reactions.resolve("🔵").users.remove(message.author.id);
                                                                                } else {
                                                                                    myAmount = myAmount + 1000
                                                                                    accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                        
                                                                                    msg.edit(accepted)
                                                                                }
                    
                                                                            })
                    
                                                                            minus100.on('collect', async () => {
                                                                                msg.reactions.resolve("🟠").users.remove(message.author.id);

                                                                                if((myAmount - 100) < 0) {
                                                                                    msg.reactions.resolve("🟠").users.remove(message.author.id);
                                                                                    
                                                                                } else {
                                                                                    myAmount = myAmount - 100
                                                                                    accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                }
                                                                                
                                                                            })
                    
                                                                            plus100.on('collect', async () => {
                                                                                msg.reactions.resolve("🟢").users.remove(message.author.id);
                    
                                                                                if((myAmount + 100) > 999999999) {
                                                                                    msg.reactions.resolve("🟢").users.remove(message.author.id);
                    
                                                                                } else {
                                                                                    myAmount = myAmount + 100
                                                                                    accepted.fields[0] = {name : `🏦 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                }
                                                                            })
                                                                            
                    
                                                                            save.on('collect', async () => {
                                                                                msg.reactions.resolve("📩").users.remove(message.author.id);

                                                                                    plus1000.stop()
                                                                                    minus1000.stop()
                                                                                    plus100.stop()
                                                                                    minus100.stop()
                                                                                    
                                                                                    await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user.id}, {$set: {bank: myAmount, total: myAmount + userBal}})
                                                                                    accepted.setDescription(`Částka na bankovním účtu uživatele ${user} byla úspěšně nastavena na **${myAmount}** ${config.discord.bot.currency}`)
                                                                                    msg.edit(accepted)
                                                                                
                                                                            })
                    
                                                                            })
                                 
                                                                        })
                                                                    })
                                                                
                                                        })
                
                                                    })
                                                        // wallet reaction
                                                        wallett.on("collect", async () => {

                                                            var myAmount = 0
                                                            var hisAmount = 0
                    
                                                            await msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                                            accepted.setDescription(`${message.author}, **nyní prosím zadej částku, kterou chceš uživateli nastavit:**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`🏦 ${message.author.username}'s Offer`, `**Množství:** ${myAmount} ${config.discord.bot.currency}`)
                                                            await msg.edit(accepted)
                    
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
                                                                                    accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                } else {
                                                                                    myAmount = myAmount - 1000
                                                                                    accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                }
                                                                            })
                    
                                                                            plus1000.on('collect', async () => {
                                                                                msg.reactions.resolve("🔵").users.remove(message.author.id);
                    
                                                                                if((myAmount + 1000) > 999999999) {
                                                                                    msg.reactions.resolve("🔵").users.remove(message.author.id);
                                                                                } else {
                                                                                    myAmount = myAmount + 1000
                                                                                    accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                        
                                                                                    msg.edit(accepted)
                                                                                }
                    
                                                                            })
                    
                                                                            minus100.on('collect', async () => {
                                                                                msg.reactions.resolve("🟠").users.remove(message.author.id);

                                                                                if((myAmount - 100) < 0) {
                                                                                    msg.reactions.resolve("🟠").users.remove(message.author.id);
                                                                                    
                                                                                } else {
                                                                                    myAmount = myAmount - 100
                                                                                    accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                }
                                                                                
                                                                            })
                    
                                                                            plus100.on('collect', async () => {
                                                                                msg.reactions.resolve("🟢").users.remove(message.author.id);
                    
                                                                                if((myAmount + 100) > 999999999) {
                                                                                    msg.reactions.resolve("🟢").users.remove(message.author.id);
                    
                                                                                } else {
                                                                                    myAmount = myAmount + 100
                                                                                    accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
                    
                                                                                    msg.edit(accepted)
                                                                                }
                                                                            })
                                                                            
                    
                                                                            save.on('collect', async () => {
                                                                                msg.reactions.resolve("📩").users.remove(message.author.id);

                                                                                    plus1000.stop()
                                                                                    minus1000.stop()
                                                                                    plus100.stop()
                                                                                    minus100.stop()
                                                                                    
                                                                                    await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user.id}, {$set: {wallet: myAmount, total: myAmount + userBank}})
                                                                                    accepted.setDescription(`Částka v peněžence uživatele ${user} byla úspěšně nastavena na **${myAmount}** ${config.discord.bot.currency}`)
                                                                                    return msg.edit(accepted)
                                                                                
                                                                            })
                    
                                                                            })
                                 
                                                                        })
                                                                })
                                                            })
                                                        })
                                                    




                                                })
                                            })
                                            })
                                    })

                                    // wallet reaction
                                    wallet.on("collect", async () => {
                                        var myAmount = 0
                                        var hisAmount = 0

                                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        accepted.setDescription(`${message.author}, ${message.author}, **nyní prosím zadej částku, kterou chceš uživateli darovat:**\n-1000 ➤ 🔴\n-100 ➤ 🟠\n+100 ➤ 🟢\n+1000 ➤ 🔵\nUložit/Pokračovat ➤ 📩`).addField(`🏦 ${message.author.username}'s Bank`, `**Množství:** ${myAmount} ${config.discord.bot.currency}`)
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

                                                                myAmount = myAmount - 1000
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}

                                                                msg.edit(accepted)
                                                            
                                                        })

                                                        plus1000.on('collect', async () => {
                                                            msg.reactions.resolve("🔵").users.remove(message.author.id);

                                                            if((myAmount + 1000) > 999999999) {
                                                                msg.reactions.resolve("🔵").users.remove(message.author.id);
                                                            } else {
                                                                myAmount = myAmount + 1000
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}
    
                                                                msg.edit(accepted)
                                                            }

                                                        })

                                                        minus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟠").users.remove(message.author.id);

                                                                myAmount = myAmount - 100
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}

                                                                msg.edit(accepted)
                                                            
                                                            
                                                        })

                                                        plus100.on('collect', async () => {
                                                            msg.reactions.resolve("🟢").users.remove(message.author.id);

                                                            if((myAmount + 100) > 999999999) {
                                                                msg.reactions.resolve("🟢").users.remove(message.author.id);

                                                            } else {
                                                                myAmount = myAmount + 100
                                                                accepted.fields[0] = {name : `💰 ${message.author.username}'s Offer`, value : `**Množství:** ${myAmount} ${config.discord.bot.currency}`}

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
                                                                
                                                                await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user.id}, {$set: {wallet: userBal + myAmount, total: userTotal + myAmount}})
                                                                accepted.setDescription(`Úspěšně bylo darováno **${myAmount}** ${config.discord.bot.currency} do peněženky uživatele ${user}`)
                                                                msg.edit(accepted)
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
                                                        
                            })
             
                    })
            }
    }
                                    
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}