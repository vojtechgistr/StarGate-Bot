var npmmodules = require("../npm-modules")

var config = require("../config.json")

module.exports = function(id, owner){
            return new npmmodules.Discord.MessageEmbed()
                .setColor("0x4287f5")
                .setTitle("💵 Economy Help")
                .setDescription(`Current currency is **1** ${config.discord.bot.currency}`)
                .addField(config.discord.bot.prefix + "bal", "➤ zobrazí váš aktuální měnový stav")
                .addField(config.discord.bot.prefix + "with [množství/all]", "➤ pomocí příkazu `withdraw` si můžete vybrat peníze z banky")
                .addField(config.discord.bot.prefix + "dep [množství/all]", "➤ díky funkci `deposit` si lze vložit peníze do banky")
                .addField(config.discord.bot.prefix + "leaderboard", "➤ zobrazí ty nejlepší z nejlepších z celého světa")
                //.addField(config.discord.bot.prefix + "trade [uživatel]", "➤ chceš udělat pořádný deal? Zkus trade command!")
                .addField(config.discord.bot.prefix + "mine", "➤ pomocí tohoto příkazu můžete těžit rudy, které později můžete prodávat")
                .addField(config.discord.bot.prefix + "inv", "➤ otevře váš inventář")
                .addField(config.discord.bot.prefix + "sell [ore] [množství]", "➤ prodej rud a ostatních vzácných věcí")
                .addField(config.discord.bot.prefix + "buy [item] [množství]", "➤ pomocí příkazu `buy` můžete nakupovat v marketu")
                .addField(config.discord.bot.prefix + "rob [uzivatel]", "➤ pomocí tohoto příkazu můžete okrádat své kamarády")
                .addField(config.discord.bot.prefix + "market", "➤ otevře market, ve kterém můžete nakupovat lepší vybavení nebo výhody na serveru")
                .addField(config.discord.bot.prefix + "ores", "➤ otevře ceník výkupu rud")
                .addField(config.discord.bot.prefix + "item [ID]", "➤ zobrazí informaci o daném předmětu")
                .setFooter(`This bot was developed by ${owner}`)
}