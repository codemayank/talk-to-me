import io from 'socket.io-client'
class ChatUiController {
  constructor($routeParams, $location, $timeout, $scope, moment) {
    this.routeParams = $routeParams
    this.location = $location
    this.scope = $scope
    this.socket = undefined
    this.timeout = $timeout
    this.moment = moment
    this.typing = false
    this.timeOutVar = undefined
    this.friendTyping = false
  }

  $onDestroy() {
    this.socket.emit('disconnecting', { friendIndex: this.friendIndex })
    this.socket.disconnect()
    console.log('the socket was disconnected')
  }

  $onInit() {
    this.friendName = this.routeParams.username
    this.socketEventListen()
  }

  socketEventListen() {
    let friend = {
      _id: this.routeParams.id,
      username: this.routeParams.username
    }

    this.socket = io.connect()
    this.socket.emit('userConnected', { friend })

    this.socket.on('friendStatus', data => {
      if (data.status === 'success') {
        console.log(data)
        this.conversation = data.conversation
        this.friendIndex = data.friendIndex

        this.notification = data.message
        this.user = data.user
        this.timeout(() => {
          this.notification = false
        }, 5000)
        this.scope.$apply()
      } else if (data.status === 'failure') {
        this.location.path('/user/dashboard')
      }
    })
    this.socket.on('receiveIncomingMessage', data => {
      this.conversation.messages.push(data.message)
      this.scope.$apply()
    })
    this.socket.on('friendDisconnected', data => {
      this.friendIndex = -1
      this.scope.$apply()
    })
    this.socket.on('friendTyping', () => {
      this.friendTyping = true
      this.scope.$apply()
    })
    this.socket.on('friendStoppedTyping', () => {
      this.friendTyping = false
      this.scope.$apply()
    })
  }
  timeOutCallback() {
    this.typing = false
    this.socket.emit('stoppedTyping')
  }

  onKeyDown() {
    if (this.typing === false) {
      typing = true
      this.socket.emit('startedTyping', { friendIndex: this.friendIndex })
      this.timeOutVar = setTimeout(timeOutCallback, 500)
    } else {
      clearTimeout(this.timeOutVar)
      this.timeOutVar = setTimeout(timeOutCallback, 500)
    }
  }

  onNewMessage() {
    console.log('on new message was fired')
    let message = {
      from: this.user.username,
      to: this.routeParams.username,
      text: this.newMessage
    }
    let sendToId = this.routeParams.id

    this.socket.emit(
      'newMessage',
      { message: message, friendIndex: this.friendIndex },
      message => {
        this.conversation.messages.push(message.message)
        this.newMessage = ''
        this.scope.$apply()
      }
    )
  }
}

export default ChatUiController
