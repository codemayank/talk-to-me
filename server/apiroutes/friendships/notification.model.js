const mongoose = require('mongoose')

//setup the notification model
let notificationSchema = new mongoose.Schema({
  message: String,
  friendShip: { type: mongoose.Schema.Types.ObjectId, ref: 'FriendShip' },

  createdAt: { type: Date, default: new Date().getTime() }
})

module.exports = mongoose.model('Notification', notificationSchema)
