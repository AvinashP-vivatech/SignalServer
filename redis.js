const redis = require('redis');
const { REDIS_HOST, REDIS_PORT } = require('./config/redis.js');

client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT
});

client.on('connect', () => {
  console.log('Redis Server Connected')
});

client.on('error', (err) => {
  console.error(err)
});

module.exports = client;