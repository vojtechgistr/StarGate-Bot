var modules = {
    mongodb: require("./mongodb")
}

module.exports = async function(userID, itemID){
    var items = await modules.mongodb.collections.inventory.find({user_id: userID, item_id: Number(itemID)}).toArray()

    var have = 0

    items.forEach(item => {
        have += item.count
    })

    return have
}