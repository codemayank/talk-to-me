/**
 * Chat ui controller module
 */

import io from 'socket.io-client'
class ChatUiController {
  constructor($timeout, $scope, moment, $location, $anchorScroll) {
    'ngInject'
    //define all scope variables and methods
    this.scope = $scope
    this.socket = undefined
    this.timeout = $timeout
    this.moment = moment
    this.typing = false
    this.timeOutVar = undefined
    this.friendTyping = false
    this.conversations = []
    this.currentFriend
    this.currentConversation
    this.disableInput = true
    this.chatView = false
    this.glued = true
  }

  $onDestroy() {
    //when this component is destroyed i.e. app moves to other component the socket disconnectes
    this.socket.disconnect()
  }

  $onInit() {
    //connect with socketio server
    this.socket = io.connect()
    //listen to user connected events
    this.socket.on('userConnected', data => {
      this.friends = data.myFriendsStatus

      this.conversations = data.myConversations
      this.user = data.user

      this.socketEventListen()

      this.scope.$apply()
    })
  }
  setFriendListView() {
    this.chatView = false
  }

  //function to select friend with friendId in the friends list to set current friend and load chat page
  selectFriend(friendId) {
    this.chatView = true
    let index = this.conversations.findIndex(x => {
      if (x.userone === friendId || x.usertwo === friendId) {
        return x
      }
    })
    let friendIndex = this.friends.findIndex(x => x.friendId === friendId)
    this.currentConversation = this.conversations[index]

    this.currentFriend = this.friends[friendIndex]
    this.disableInput = false
  }

  sendMessage(messageText) {
    let message = {
      from: this.user.username,
      to: this.currentFriend.username,
      text: this.newMessage
    }
    //socket event emitter to emit new messages to server
    this.socket.emit(
      'newMessage',
      {
        message: message,
        conversation: this.currentConversation._id,
        friendId: this.currentFriend.friendId
      },
      data => {
        this.currentConversation.messages.push(data.message)
        this.newMessage = ''
        this.scope.$apply()
      }
    )
  }
  socketEventListen() {
    //socket event listener to receive new messages from the socket io server
    this.socket.on('sendMessage', data => {
      let index = this.conversations.findIndex(x => x._id === data.conversation)
      if (index > -1) {
        this.conversations[index].messages.push(data.message)
      }
      this.scope.$apply()
    })

    //socket event listener to receive new friend joined data
    this.socket.on('friendJoined', data => {
      let index = this.friends.findIndex(x => x.friendId === data.friendId)
      if (index > -1) {
        this.friends[index].status = 'online'
      } else {
        this.friends.push(data)
      }
      if (this.currentFriend && this.currentFriend.friendId === data.friendId) {
        let message = 'is now online'
        this.createNotification(message)
      }
      this.scope.$apply()
    })

    //socket event listener to receive disconnected friends data
    this.socket.on('friendDisconnected', data => {
      let index = this.friends.findIndex(x => x.friendId === data.friendId)
      if (index > -1) {
        this.friends[index].status = 'offline'
      }
      if (this.currentFriend && this.currentFriend.friendId === data.friendId) {
        let message = 'has disconnected'
        this.createNotification(message)
      }
      this.scope.$apply()
    })

    //socket event listener to listen to user / friend typing events
    this.socket.on('friendTyping', data => {
      this.friendTyping = data.friendId
      this.scope.$apply()
    })

    //socket event listener to listen to user / friend stopped typing events
    this.socket.on('friendStoppedTyping', data => {
      console.log('a friend has stopped typing')
      this.friendTyping = ''
      this.scope.$apply()
    })
  }

  //function to emit user typing events to the socket server whenever user types something in the message box
  onKeyDown() {
    if (this.typing === false) {
      this.typing = true
      this.socket.emit('startedTyping', {
        friendId: this.currentFriend.friendId
      })
      this.timeOutVar = setTimeout(() => {
        //if user does not type anything in 500ms from then stopped typing event is emitted to the server
        this.typing = false
        this.socket.emit('stoppedTyping', {
          friendId: this.currentFriend.friendId
        })
      }, 500)
    } else {
      clearTimeout(this.timeOutVar)
      this.timeOutVar = setTimeout(() => {
        this.typing = false
        this.socket.emit('stoppedTyping', {
          friendId: this.currentFriend.friendId
        })
      }, 500)
    }
  }

  //function to apply css classes to messages
  alignMessage(message) {
    if (message.from !== this.user.username) {
      return 'message-main-receiver'
    } else {
      return 'message-main-sender'
    }
  }
  messageOwner(message) {
    if (message.from !== this.user.username) {
      return 'chat-message-to-me'
    } else {
      return 'chat-message-from-me'
    }
  }
  //function to create new notifications based on user status changes
  createNotification(message) {
    this.notification = message
    setTimeout(() => {
      this.notification = false
      console.log(this.notification)
      this.scope.$apply()
    }, 2000)
  }

  //function to style the status bulb based on friends status
  styleStatus(status) {
    if (status === 'online') {
      return 'online'
    } else {
      return 'offline'
    }
  }
}

export default ChatUiController
