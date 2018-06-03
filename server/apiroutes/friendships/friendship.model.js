const mongoose = require('mongoose')

let friendShipSchema = new mongoose.Schema({
  friend1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  friend2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confirmed: { type: Boolean, default: false }
})

module.exports = mongoose.model('FriendShip', friendShipSchema)
