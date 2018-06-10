/*
 * setting up redis client
 * */

const Redis = require('ioredis')
const redis = new Redis()

module.exports = redis


