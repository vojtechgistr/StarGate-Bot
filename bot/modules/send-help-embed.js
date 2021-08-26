var npmmodules = require("../npm-modules")

var discordEmbeds = require("../discord-embeds")

var modules = {
    discordClient: require("./discord-client")
}

require('../modules/ReplyMessage')

module.exports = async function(channel){
    var own = await modules.discordClient.users.cache.get('484448041609199620')
    own = own.tag
    var message = await channel.send(discordEmbeds.help(0, own)).catch(() => {})
    if(!message)
        return
}