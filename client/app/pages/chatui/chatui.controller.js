import io from 'socket.io-client'
class ChatUiController {
  constructor($routeParams, $location, $timeout, $scope, moment) {
    this.routeParams = $routeParams
    this.location = $location
    this.scope = $scope
    this.socket = undefined
    this.timeout = $timeout
    this.moment = moment
  }

  $onDestroy() {
    this.socket.disconnect()
    console.log('the socket was disconnected')
  }

  $onInit() {
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
      { message: message, sendTo: sendToId },
      message => {
        this.conversation.messages.push(message.message)
        this.newMessage = ''
        this.scope.$apply()
      }
    )
  }
}

export default ChatUiController
