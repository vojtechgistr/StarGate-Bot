var config = require("../config.json")

var itemsArray = []

Object.keys(config.discord.economy).forEach(key => {
    config.discord.economy[key].id = Number(key)
    itemsArray.push(config.discord.economy[key])
})

module.exports = itemsArray