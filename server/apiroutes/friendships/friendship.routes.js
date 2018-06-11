const router = require('express').Router()
const User = require('../user/user.model')
const FriendShip = require('./friendship.model')
const Notification = require('./notification.model')
const Conversation = require('../../sockets/conversation.model')
const authenticate = require('../middlewares/authenticate').AuthCheck
const events = require('events')
const notificationEvents = new events.EventEmitter()
const log = require('../../logger')

router.post('/friend-request', authenticate, (req, res) => {
  let friendId = req.body.friendId
  if (friendId == req.user._id) {
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
        FriendShip.populate(newFriendShip, {
          path: 'friend1 friend2',
          select: 'username'
        }).then(friendShip => {
          res.send({ newFriendShip: friendShip })
        })
      })
    })
    .catch(e => {
      log.error('could not register friend request', e)
      res.status(400).send()
    })
})
//route to handle friend request acceptance
router.get('/friend-request/accept/:id', authenticate, (req, res) => {
  let id = req.params.id
  async function FriendReqAccept() {
    let friendShip
    try {
      friendShip = await FriendShip.findOneAndUpdate(
        { _id: id, friend2: req.user._id, confirmed: false },
        { confirmed: true },
        { new: true }
      ).populate('friend1 friend2', 'username')
      if (!friendShip) {
        return res.status(401).send()
      }
      notificationEvents.emit('fRAccepted', {
        friendShip: friendShip,
        acceptor: req.user
      })
      return res.send({ friendShip })
    } catch (e) {
      log.error('unable to confirm firend request', e)
      res.status(400).send()
    }
  }
  FriendReqAccept()
})

//route to handle friend-request cancellation
router.get('/friend-request/cancel/:id', authenticate, (req, res) => {
  let id = req.params.id
  async function friendReqCancel() {
    let friendShip
    try {
      friendShip = await FriendShip.findByIdAndRemove({ _id: id }).populate(
        'friend1 friend2',
        'username'
      )
      notificationEvents.emit('fRCancelled', {
        friendShip: friendShip,
        cancellor: req.user
      })
      res.send({ friendShip })
    } catch (e) {
      log.error('friend request cancelled', e)
      res.status(400).send()
    }
  }
  friendReqCancel()
})

notificationEvents.on('fRSent', data => {
  let newNotification = new Notification({
    message: `${data.requester.username} sent you a friend request`,
    friendShip: data.friendShip
  })

  async function handleFRSent() {
    let notification
    try {
      notification = await newNotification.save()
      console.log(notification)
      return User.findByIdAndUpdate(data.friendShip.friend2, {
        $push: { notifications: notification._id }
      }).then(user => {
        console.log(user)
      })
      console.log('user notification saved')
    } catch (e) {
      log.error('error registering notification for friend request send', e)
    }
  }
  handleFRSent()
})

notificationEvents.on('fRAccepted', data => {
  let newNotification = new Notification({
    message: `${data.acceptor.username} accepted your friend request`
  })
  let newConversation = new Conversation({
    userone: data.friendShip.friend1,
    usertwo: data.friendShip.friend2
  })
  let friendShip = data.friendShip
  async function saveUserFriend() {
    let notification
    let conversation
    try {
      notification = await newNotification.save()
      conversation = await newConversation.save()
      FriendShip.findByIdAndUpdate(friendShip._id, {
        conversation: conversation._id
      }).then(friendShip => {
        console.log(friendShip)
      })
      User.findByIdAndUpdate(friendShip.friend1, {
        $push: {
          notifications: notification._id,
          friends: friendShip._id
        }
      }).then(user => {
        console.log(user)
      })

      User.findByIdAndUpdate(friendShip.friend2, {
        $push: {
          friends: friendShip._id
        }
      }).then(user => {
        console.log(user)
      })
    } catch (e) {
      log.error(
        'there has been an error in registering the friend request acceptance notification',
        e
      )
    }
  }
  saveUserFriend()
})

notificationEvents.on('fRCancelled', data => {
  let newNotification = new Notification({
    message: `${data.cancellor.username} declined your friend request.`
  })
  async function fRCancelledNotification() {
    let notification
    try {
      notification = await newNotification.save()
      User.findByIdAndUpdate(data.friendShip.friend1, {
        $push: { notifications: notification._id }
      }).then(() => {
        return
      })
    } catch (e) {
      log.error(
        'there has been an error in generating the friend request cancellation notification',
        e
      )
    }
  }
  fRCancelledNotification()
})

module.exports = router
