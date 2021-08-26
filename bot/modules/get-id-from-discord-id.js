var modules = {
    mongodb: require("./mongodb")
}

module.exports = async function(discordID){
    return (await modules.mongodb.collections.users.findOne({discord_id: discordID}) || {})._id
}