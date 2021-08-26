var modules = require("../modules")

var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var config = require('../config.json')

const db = require('quick.db')
const ms = require('parse-ms');
const fs = require('fs')

require('../modules/ReplyMessage')

module.exports = {
    permissions: [],
    prefixes: ["rob"],
    execute: async function(message, databaseUser) {
        let timeout = 0;
        //let timeout = 86400000;

        const user = message.mentions.users.first();

        let rob = await db.fetch(`rob_${message.guild.id}_${message.author.id}`)
        

        if(rob === undefined) {
            db.add(`rob_${message.guild.id}_${message.author.id}`)
        }

        if(rob != null && timeout - (Date.now() - rob) > 0) {
            const time = ms(timeout - (Date.now() - rob));
            return message.channel.send(discordEmbeds.warning(`Pozor`, `Než se pokusíš někoho znovu okrást, musíš ještě počkat **${time.hours} hodin, ${time.minutes} minut and ${time.seconds} sekund**.`)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })
        

        } else {
            
            if(!user) return message.channel.send(discordEmbeds.warning(`Chyba`, `Omlouvám se, ale tohoto uživatele jsem nenašel..`)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })

            if(user.bot) return message.channel.send(discordEmbeds.warning(`Pozor`, `Boti nejsou součástí ekonomiky!`)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })

            if(user.id === message.author.id) return message.channel.send(discordEmbeds.warning(`Pozor`, `Nemůžeš okrást sebe ty hlupáku.`)).then(m => {
                m.delete({timeout: 10000})
                message.delete({timeout: 10000})
            })

            let rob2his = await db.fetch(`rob2_${message.guild.id}_${user.id}`)
            let rob2 = await db.fetch(`rob2_${message.guild.id}_${message.author.id}`)
            
                    db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
                    db.set(`rob2_${message.guild.id}_${user.id}`, "False");

            //my bal
            const economy = await modules.mongodb.collections.economy.find({user_id: message.author.id}).toArray()

            var bal = 0
            var total = 0
    
            var economyList = {}
    
            economy.forEach(data => {
                bal = parseInt(data.wallet)
                total = parseInt(data.total)
                economyList = data
            });
    
    
            if(isEmpty(economyList) === true) {
                await modules.mongodb.collections.economy.insertOne({user_id: message.author.id, wallet: 0, bank: 0, total: 0})
            }

            //his bal
            const economy2 = await modules.mongodb.collections.economy.find({user_id: user.id}).toArray()

            var hisBal = 0
            var hisTotal = 0
    
            var economyList2 = {}
    
            economy2.forEach(data => {
                hisBal = parseInt(data.wallet)
                hisTotal = parseInt(data.total)
                economyList2 = data
            });
    
    
            if(isEmpty(economyList2) === true) {
                await modules.mongodb.collections.economy.insertOne({user_id: user.id, wallet: 0, bank: 0, total: 0})
            }


            let amountToRob = Math.floor(Math.random() * (hisBal - 2 + 1)) + 2;

            if(hisBal < 1) {
                return message.channel.send(discordEmbeds.warning(`Pozor`, `Peněženka uživatele **${user.username}** je skoro prázdná.. *F pro jeho peněženku.*`)).then(m => {
                    m.delete({timeout: 10000})
                    message.delete({timeout: 10000})
                })
                
            }

            if(bal < 500) {
                return message.channel.send(discordEmbeds.warning('Pozor', 'Pro zahájení loupeže musíš mít nejméně **500 :coin: SC**!')).then(m => {
                    m.delete({timeout: 10000})
                    message.delete({timeout: 10000})
                })
            }

            if(rob2 === null) {
                db.set(`rob2_${message.guild.id}_${message.author.id}`, "True");
            }

            if(rob2his === null) {
                db.set(`rob2_${message.guild.id}_${user.id}`, "True");
            }

            db.set(`rob2_${message.guild.id}_${message.author.id}`, "True");
            db.set(`rob2_${message.guild.id}_${user.id}`, "True");

            if (rob2 === "True") return message.inlineReply('Nemůžeš konat dvě loupeže najednou!')
            if (rob2his === "True") return message.inlineReply('Nemůžeš konat dvě loupeže najednou!')
        
                let paid = new npmmodules.Discord.MessageEmbed()
                .setTitle(`💰 Loupež začala`)
                .setColor('0x0000')
                .setDescription(`Bylo ukradeno **${amountToRob} :coin: SC** z peněženky **${user}**! Rychle uteč, než zjistí, že jsi ho okradl!`)
                .setFooter(`Policie může být zavolána do 30 sekund..`)
                .setTimestamp();

                message.inlineReply(paid);

                message.channel.send(`Hej ${user}, někdo ti utíká se tvými penězi! Musíš zavolat polici, ale pospěš si.. Do chatu napiš \`call\` pro zahájení hovoru, ale dělej, **zbývá ti jen pár sekund, než ti uteče!**`)

                await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {wallet: bal + amountToRob, total: total + amountToRob}})
                await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user.id}, {$set: {wallet: hisBal - amountToRob, total: hisTotal - amountToRob}})

                message.channel.awaitMessages(async message => user.id === message.author.id,
                    {max: 1, time: 30000}).then(async collected => {

                        if(collected.first().content.toLowerCase() == 'call') {

                            let calling = new npmmodules.Discord.MessageEmbed()
                                .setDescription(`📴 Mobil se zapíná...`)
                            message.channel.send(calling).then(m => {
                                setTimeout(async () => {
                                    calling.setDescription(`📲 Hledání kontaktu...`)
                                    m.edit(calling)
                                }, 1000)

                                setTimeout(async () => {
                                    calling.setDescription(`📱 Vyzvánění...`)
                                    m.edit(calling)
                                }, 4000)

                                setTimeout(async () => {
                                    calling.setDescription(`🔔 Hovor přijat!`)
                                    m.edit(calling)
                                }, 7000)

                                setTimeout(async () => {
                                    calling.setTitle(`<:pandapolice:810153991089946707> Zloděj byl chycen!`)
                                            .setColor('0x0000')
                                            .setDescription(`a zplatil pokutu 500 :coin: SC...`)
                                            .setTimestamp();
                                        m.edit(calling)
                            
                                            db.set(`rob_${message.guild.id}_${message.author.id}`, Date.now());

                                            await modules.mongodb.collections.economy.findOneAndUpdate({user_id: message.author.id}, {$set: {wallet: bal - 500, total: total - 500}})
                                            await modules.mongodb.collections.economy.findOneAndUpdate({user_id: user.id}, {$set: {wallet: hisBal, total: hisTotal}})
                                            db.set(`rob_${message.guild.id}_${message.author.id}`, Date.now());
                                            db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
                                            db.set(`rob2_${message.guild.id}_${user.id}`, "False");

                                            
                                }, 7700)

                                
                            })
                        } else {
                            let calling = new npmmodules.Discord.MessageEmbed()
                                .setDescription(`📴 Mobil se zapíná...`)
                            message.channel.send(calling).then(m => {
                                setTimeout(async () => {
                                    calling.setDescription(`📲 Hledání kontaktu...`)
                                    m.edit(calling)
                                }, 1000)

                                setTimeout(async () => {
                                    calling.setDescription(`📱 Vyzvánění...`)
                                    m.edit(calling)
                                }, 4000)

                                setTimeout(async () => {
                                    calling.setTitle(`:x: Volané číslo neexistuje!`)
                                            .setColor('0x0000')
                                            .setDescription(`Nejspíše ses přepsal při zadávání čísla policie.. Pozor, tohle bys už mél ale umět!`)
                                            .setTimestamp();
                                        m.edit(calling)

                                        setTimeout(async () => {
                                            calling.setTitle(`💰 Loupež se povedla!`)
                                            .setColor('0x0000')
                                            .setDescription(`${user}, špatná zpráva! Zloděj utekl, protože jsi asi usnul! Ukradl ti **${amountToRob} :coin: SC** ze tvé peněženky..`)
                                            .setTimestamp();
                                        m.edit(calling)
                                        }, 5000)
                            
                                        db.set(`rob_${message.guild.id}_${message.author.id}`, Date.now());
                                        db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
                                        db.set(`rob2_${message.guild.id}_${user.id}`, "False");
                                        //message.channel.send(`${user}, špatná zpráva! Zloděj utekl, protože ses přepsal ty chuligáne! Ukradl ti **${amountToRob} :coin: SC** ze tvé peněženky..`)
                                        return;

                                            
                                }, 7700)

                                
                            })
                        }}).catch(async () => {

                            var em = new npmmodules.Discord.MessageEmbed()
                                .setTitle(`💰 Loupež se povedla!`)
                                .setColor('0x0000')
                                .setDescription(`${user}, špatná zpráva! Zloděj utekl, protože jsi asi usnul! Ukradl ti **${amountToRob} :coin: SC** ze tvé peněženky..`)
                                .setTimestamp();
                            message.channel.send(em)
                            db.set(`rob2_${message.guild.id}_${message.author.id}`, "False");
                            db.set(`rob2_${message.guild.id}_${user.id}`, "False");
                            db.set(`rob_${message.guild.id}_${message.author.id}`, Date.now());

                            return;
                    });
                }
            }
    
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}