var NPMModules = {
    mongodb: require("mongodb")
}

const { MongoClient, ObjectID } = require("mongodb");
const uri = "mongodb://localhost/";
const client = new MongoClient(uri, { useUnifiedTopology: true });
client.connect()
const db = client.db('starbot')

module.exports = {
    client: MongoClient,
    ObjectID: ObjectID,
    database: db,
    collections: {
        users: db.collection("users"),
        economy: db.collection("economy"),
        inventory: db.collection("inventory"),
        orehistory: db.collection("orehistory"),
        eggs: db.collection("eggs")
    }
    
}