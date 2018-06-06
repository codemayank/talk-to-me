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

    let userObj = {
      _id: user._id
    }
    socket.on('userConnected', data => {
      userObj.socket = socket.id
      let friendIndex = connectedUsers.findIndex(x => x._id === data.friend._id)

      let textStr = ''
      connectedUsers.push(userObj)
      if (friendIndex === -1) {
        textStr =
          data.friend.username +
          ' is currently offline but you can still send them messages they will be abe to read your messages once they are online'
      } else {
        textStr = data.friend.username + ' is online say hi!'
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
            conversation: data.conversation,
            friendIndex: friendIndex
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
      if (data.friendIndex === -1) {
        let friendIndex = connectedUsers.findIndex(x => x._id === data.sendTo)
        if (friendIndex > -1) {
          io.to(connectedUsers[friendIndex].socket).emit(
            'receiveIncomingMessage',
            { message: message, friendIndex: friendIndex }
          )
        }
      } else {
        io.to(connectedUsers[data.friendIndex].socket).emit(
          'receiveIncomingMessage',
          { message: message, friendIndex: friendIndex }
        )
      }
      callback({ message })
      messageStoreEvents.emit('storeMessage', { message })
    })
    socket.on('startedTyping', data => {
      if (data.friendIndex > -1) {
        io.to(connectedUsers[friendIndex].socket).emit('friendTyping')
      }
    })

    socket.on('stoppedTyping', data => {
      if (data.friendIndex > -1) {
        io.to(connectedUsers[friendIndex].socket).emit('friendStoppedTyping')
      }
    })
    socket.on('disconnecting', data => {
      if (data.friendIndex > -1) {
        let message = generateMessage(
          'Server',
          'User',
          user.username + ' has disconnected.'
        )
        io.to(connectedUsers[data.friendIndex].socket).emit(
          'friendDisconnected',
          {
            message
          }
        )
      }
      let userIndex = connectedUsers.findIndex(x => x._id === user._id)
      connectedUsers.splice(userIndex, 1)
    })
    socket.on('disconnect', () => {
      console.log('the socket has disconnected')
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
