var config = require("../config.json")
var npmmodules = require("../npm-modules")

var discordClient = new npmmodules.Discord.Client()
discordClient.login(config.discord.bot.token)

module.exports = discordClient