const events = require('events')
const messageStoreEvents = new events.EventEmitter()

const User = require('../apiroutes/user/user.model')
const FriendShips = require('../apiroutes/friendships/friendship.model')
const passportSetup = require('../passport.setup')
const Conversation = require('./conversation.model')
const log = require('../logger')

const connectedUsers = []

function generateMessage(from, to, text) {
  return {
    from,
    to,
    text,
    createdAt: new Date().getTime()
  }
}

module.exports.controller = server => {
  let io = require('socket.io')(server)
  io.use((socket, next) => {
    passportSetup.sessionMiddleware(socket.request, {}, next)
  })
  let currentConversation = undefined

  io.on('connection', socket => {
    let user = socket.request.session.passport.user //get user data from session object
    let friendIndex = undefined
    let userObj = {
      _id: user._id,
      friendSocket: 'offline'
    }
    socket.on('userConnected', data => {
      userObj.socket = socket.id

      console.log(connectedUsers)
      friendIndex = connectedUsers.findIndex(x => x._id === data.friend._id)
      let textStr = ''
      if (friendIndex === -1) {
        let textStr =
          data.friend.username +
          ' is currently offline but you can still send them messages they will be abe to read your messages once they are online'
        connectedUsers.push(userObj)
      } else {
        console.log(data.friend._id, friendIndex)
        userObj.friendSocket = connectedUsers[friendIndex].socket
        connectedUsers[friendIndex].socket = userObj.socket
        connectedUsers.push(userObj)

        let textStr = data.friend.username + ' is online say hi!'
      }
      messageStoreEvents.emit('sendConversation', {
        user: user._id,
        friend: data.friend._id
      })
      let message = generateMessage('Server', 'User', textStr)
      messageStoreEvents.once('receiveConversation', data => {
        if (data.status === 'success') {
          socket.emit('friendStatus', {
            message: message,
            user: user,
            status: 'success',
            conversation: data.conversation
          })
          currentConversation = data.conversation._id
        } else if (data.status === 'failure') {
          socket.emit('friendStatus', {
            message: 'Something went wrong please try after some time',
            status: 'failure'
          })
          socket.disconnect()
        }
      })
    })

    socket.on('newMessage', (data, callback) => {
      let message = generateMessage(
        data.message.from,
        data.message.to,
        data.message.text
      )

      if (userObj.friendSocket !== 'offline') {
        console.log(friendSocket)
        io.to(userObj.friendSocket).emit('receiveIncomingMessage', { message })
      }
      callback({ message })
      messageStoreEvents.emit('storeMessage', { message })
    })

    socket.on('disconnect', () => {
      console.log('the user has disconnected the socket')
      let userIndex = connectedUsers.findIndex(x => x._id === user._id)
      connectedUsers.splice(userIndex, 1)
    })
  })
  //event handler to store messages in conversation
  messageStoreEvents.on('storeMessage', data => {
    Conversation.findByIdAndUpdate(
      currentConversation,
      { $push: { messages: data.message } },
      (err, conversation) => {
        if (err) {
          log.error('error saving message in the database', e)
        }
      }
    )
  })
  //event handler to send conversation data
  messageStoreEvents.on('sendConversation', data => {
    Conversation.findOne({
      $or: [
        { userone: data.user, usertwo: data.friend },
        { userone: data.friend, usertwo: data.user }
      ]
    })
      .then(conversation => {
        if (!conversation) {
          messageStoreEvents.emit('createNewConversation', {
            conversationData: data
          })
        } else {
          messageStoreEvents.emit('receiveConversation', {
            status: 'success',
            conversation: conversation
          })
        }
      })
      .catch(e => {
        log.error('error in getting the conversation', e)
        messageStoreEvents.emit('receiveConversation', { status: 'failure' })
      })
  })
  //event handler to create a new conversation
  messageStoreEvents.on('createNewConversation', data => {
    console.log('logging data in create new Conversation', data)
    let newConversation = new Conversation({
      userone: data.conversationData.user,
      usertwo: data.conversationData.friend
    })
    newConversation
      .save()
      .then(newConversation => {
        messageStoreEvents.emit('receiveConversation', {
          status: 'success',
          conversation: newConversation
        })
      })
      .catch(e => {
        log.error('error in creating new conversation', e)
        messageStoreEvents.emit('receiveConversation', { status: 'failure' })
      })
  })
}
