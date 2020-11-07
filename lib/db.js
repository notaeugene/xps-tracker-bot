const MongoClient = require('mongodb').MongoClient;

const uri = process.env.MONGO_ATLAS_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = async () => {
  await client.connect()
  return client.db('xps_tracker')
}