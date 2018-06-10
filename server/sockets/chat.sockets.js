const events = require('events')
const messageStoreEvents = new events.EventEmitter()

const User = require('../apiroutes/user/user.model')
const FriendShips = require('../apiroutes/friendships/friendship.model')
const passportSetup = require('../passport.setup')
const Conversation = require('./conversation.model')
const log = require('../logger')
const redis = require('../database')

function generateMessage(from, to, text) {
  return {
    from: from,
    to: to,
    text: text,
    createdAt: new Date().getTime()
  }
}

let storeMessage = async (conversation, message) => {
  try {
    await Conversation.findByIdAndUpdate(conversation, {
      $push: { messages: message }
    })
  } catch (e) {
    return log.error('error saving message in the database', e)
  }
  return 'done'
}

module.exports.controller = server => {
  let io = require('socket.io')(server)
  io.use((socket, next) => {
    passportSetup.sessionMiddleware(socket.request, {}, next)
  })
  let currentConversation = undefined
  io.on('connection', async socket => {
    let reqUser = socket.request.session.passport.user //get user data from session object

    let friendShips
    console.log(reqUser.friends)
    try {
      friendShips = await FriendShips.find({
        $or: [{ friend1: reqUser._id }, { friend2: reqUser._id }]
      })
        .populate('friend1 friend2', 'username')
        .populate('conversation', 'userone usertwo messages')
    } catch (e) {
      log.error('error getting user friendships', e)
    }
    console.log('logging reqUser', friendShips)
    redis.set(reqUser._id, socket.id)
    let myFriendIds = friendShips.map(x => {
      if (x.friend1._id.toHexString() === reqUser._id) {
        return x.friend2._id.toHexString()
      } else {
        return x.friend1._id.toHexString()
      }
    })
    let myConversations = friendShips.map(x => x.conversation)
    console.log(myConversations)

    let myFriendsStatus = friendShips.map(x => {
      if (x.friend1._id.toHexString() === reqUser._id) {
        return {
          friendId: x.friend2._id.toHexString(),
          username: x.friend2.username
        }
      } else {
        return {
          friendId: x.friend1._id.toHexString(),
          username: x.friend1.username
        }
      }
    })

    //get status of all users friends
    redis.mget(myFriendIds, (err, result) => {
      if (err) {
        return log.error('error in getting socket entries of user friends', err)
      }
      let friendObj = {}
      for (let i = 0; i < myFriendIds.length; i++) {
        if (result[i] && result[i] !== 'offline') {
          myFriendsStatus[i].status = 'online'
          //inform all of users friends that he is online

          io.to(result[i]).emit('friendJoined', {
            friendId: reqUser._id
          })
        } else {
          myFriendsStatus[i].status = 'offline'
        }
      }
      socket.emit('userConnected', {
        user: reqUser,
        myFriendsStatus: myFriendsStatus,
        myConversations: myConversations
      })
    })

    socket.on('newMessage', (data, callback) => {
      console.log(data)
      let message = generateMessage(
        data.message.from,
        data.message.to,
        data.message.text
      )
      redis.get(data.friendId, (err, result) => {
        if (result && result !== 'offline') {
          console.log('logging result in send new Message', result)
          io.to(result).emit('sendMessage', {
            message: message,
            conversation: data.conversation
          })
        }
        storeMessage(data.conversation, message)
        callback({ message })
      })
    })

    socket.on('startedTyping', data => {
      redis.get(data.friendId, (err, result) => {
        if (result && result !== 'offline') {
          io.to(result).emit('friendTyping', { friendId: reqUser._id })
        }
      })
    })

    socket.on('stoppedTyping', data => {
      redis.get(data.friendId, (err, result) => {
        if (result && result !== 'offline') {
          io.to(result).emit('friendStoppedTyping', { friendId: reqUser._id })
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('the socket was disconnected')
      //set the db socket entry to offline
      redis.set(reqUser._id, 'offline')
      //inform all friends that i have disconnected
      redis.mget(myFriendIds, (err, result) => {
        if (err) {
          return log.error(
            'error in getting socket entried of user friends',
            err
          )
        }
        for (let i = 0; i < result.length; i++) {
          if (result[i] && result !== 'offline') {
            io.to(result[i]).emit('friendDisconnected', {
              friendId: reqUser._id
            })
          }
        }
      })
    })
  })
}
