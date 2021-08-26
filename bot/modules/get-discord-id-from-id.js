var modules = {
    mongodb: require("./mongodb")
}

module.exports = async function(id){
    return (await modules.mongodb.collections.users.findOne({_id: id}) || {}).discord_id
}