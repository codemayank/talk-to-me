const router = require('express').Router()
const User = require('../user/user.model')
const FriendShip = require('./friendship.model')
const Notification = require('./notification.model')
const authenticate = require('../middlewares/authenticate').AuthCheck
const events = require('events')
const notificationEvents = new events.EventEmitter()
const log = require('../../logger')

router.post('/friend-request', authenticate, (req, res) => {
  let friendId = req.body.friendId
  if (friendId == req.user._id) {
    friend
    return res.status(401).send()
  }
  FriendShip.findOne({
    $or: [
      { friend1: friendId, friend2: req.user._id },
      { friend1: req.user._id, friend2: friendId }
    ]
  })
    .then(friendShip => {
      if (friendShip) {
        return res.status(401).send('cannot send friend request twice')
      }
      let newFriendShip = new FriendShip({
        friend1: req.user._id,
        friend2: friendId
      })
      newFriendShip.save().then(newFriendShip => {
        notificationEvents.emit('fRSent', {
          friendShip: newFriendShip,
          requester: req.user
        })
        res.send('friend request successfully registered')
      })
    })
    .catch(e => {
      log.error('could not register friend request')
      res.status(400).send()
    })
})
//route to handle friend request acceptance
router.get('/friend-request/accept/:id', authenticate, (req, res) => {
  let id = req.params.id
  FriendShip.findOneAndUpdate(
    { _id: id, friend2: req.user._id, confirmed: false },
    { confirmed: true },
    { new: true }
  )
    .then(friendShip => {
      if (!friendShip) {
        return res.status(401).send()
      }
      notificationEvents.emit('fRAccepted', {
        friendShip: friendShip,
        acceptor: req.user
      })
      res.send('friend added')
    })
    .catch(e => {
      log.error('unable to confirm firend request', e)
      res.status(400).send()
    })
})

//route to handle friend-request cancellation
router.get('/friend-request/cancel/:id', authenticate, (req, res) => {
  let id = req.params.id
  FriendShip.findByIdAndRemove({ _id: id })
    .then(friendShip => {
      notificationEvents.emit('fRCancelled', {
        friendShip: friendShip,
        cancellor: req.user
      })
      res.send('friend request cancelled')
    })
    .catch(e => {
      log.error('friend request cancelled', e)
      res.status(400).send()
    })
})

notificationEvents.on('fRSent', data => {
  let newNotification = new Notification({
    message: `${data.requester.username} sent you a friend request`,
    friendShip: data.friendShip
  })
  newNotification.save().then(notification => {
    console.log(notification)
    return User.findByIdAndUpdate(data.friendShip.friend2, {
      $push: { notifications: notification._id }
    }).catch(e => {
      log.error('error registering notification for friend request send', e)
    })
  })
})

notificationEvents.on('fRAccepted', data => {
  let newNotification = new Notification({
    message: `${data.acceptor.username} accepted your friend request`
  })
  newNotification
    .save()
    .then(notification => {
      return User.findByIdAndUpdate(data.friendShip.friend1, {
        $push: { notifications: notification._id }
      })
    })
    .catch(e => {
      log.error(
        'there has been an error in registering the friend request acceptance notification',
        e
      )
    })
})

notificationEvents.on('fRCancelled', data => {
  let newNotification = new Notification({
    message: `${data.cancellor.username} declined your friend request.`
  })
  newNotification
    .save()
    .then(notification => {
      return User.findByIdAndUpdate(data.friendShip.friend1, {
        $push: { notifications: notification._id }
      })
    })
    .catch(e => {
      log.error(
        'there has been an error in generating the friend request cancellation notification',
        e
      )
    })
})

module.exports = router
