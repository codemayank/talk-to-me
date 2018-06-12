import io from 'socket.io-client'
class ChatUiController {
  constructor($timeout, $scope, moment, $location, $anchorScroll) {
    'ngInject'
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
    this.socket.disconnect()
    console.log('the socket was disconnected')
  }

  $onInit() {
    this.socket = io.connect()
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
    console.log(
      'logging this.conversation & this.friend',
      this.conversation,
      this.currentFriend
    )
    this.disableInput = false
  }

  sendMessage(messageText) {
    let message = {
      from: this.user.username,
      to: this.currentFriend.username,
      text: this.newMessage
    }
    this.socket.emit(
      'newMessage',
      {
        message: message,
        conversation: this.currentConversation._id,
        friendId: this.currentFriend.friendId
      },
      data => {
        console.log(data)
        this.currentConversation.messages.push(data.message)
        this.newMessage = ''
        this.scope.$apply()
      }
    )
  }
  socketEventListen() {
    this.socket.on('sendMessage', data => {
      let index = this.conversations.findIndex(x => x._id === data.conversation)
      if (index > -1) {
        this.conversations[index].messages.push(data.message)
      }
      this.scope.$apply()
    })
    this.socket.on('friendJoined', data => {
      console.log('friend joined', data)
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
    this.socket.on('friendDisconnected', data => {
      console.log('friend disconnedted', data)
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
    this.socket.on('friendTyping', data => {
      console.log('a friend is typing')
      console.log(data)
      this.friendTyping = data.friendId
      this.scope.$apply()
    })
    this.socket.on('friendStoppedTyping', data => {
      console.log('a friend has stopped typing')
      this.friendTyping = ''
      this.scope.$apply()
    })
  }

  onKeyDown() {
    console.log('logging on key down')
    if (this.typing === false) {
      this.typing = true
      this.socket.emit('startedTyping', {
        friendId: this.currentFriend.friendId
      })
      this.timeOutVar = setTimeout(() => {
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

  createNotification(message) {
    this.notification = message
    setTimeout(() => {
      this.notification = false
      console.log(this.notification)
      this.scope.$apply()
    }, 2000)
  }
  styleStatus(status) {
    if (status === 'online') {
      return 'online'
    } else {
      return 'offline'
    }
  }
}

export default ChatUiController
