class UserDashboardController {
  constructor(UserService, FriendService, $location) {
    'ngInject'
    this.userService = UserService
    this.friendService = FriendService
    this.location = $location
  }

  onLogout() {
    this.userService
      .logout()
      .then(data => {
        this.location.path('/home')
      })
      .catch(e => {
        console.log(e)
      })
  }

  onSendFriendRequest(friendId) {
    this.friendService
      .sendFriendRequest(friendId)
      .then(data => {
        this.fromFriendRequestPending.push(data.newFriendShip)
        this.users.splice(this.users.findIndex(x => x._id === friendId), 1)
      })
      .catch(e => {
        console.log(e)
      })
  }
  onAcceptFriendRequest(friendShipId) {
    this.friendService
      .acceptFriendRequest(friendShipId)
      .then(data => {
        this.toFriendRequestPending.splice(
          this.toFriendRequestPending.findIndex(x => x._id === friendShipId),
          1
        )
        this.myFriends.push(data.friendShip)
      })
      .catch(e => {
        console.log('could not add friend', e)
      })
  }

  onCancelFriendRequest(friendShipId, number) {
    this.friendService
      .cancelFriendRequest(friendShipId)
      .then(data => {
        this.fromFriendRequestPending.splice(
          this.fromFriendRequestPending.findIndex(
            x => x._id === data.friendShip._id
          ),
          1
        )
        if (number === 1) {
          this.users.push(data.friendShip.friend2)
        }
        if (number === 2) {
          this.users.push(data.friendShip.friend1)
        }
      })
      .catch(e => {
        console.log('could not cancel friend request')
      })
  }

  $onInit() {
    this.userService
      .getDashboardData()
      .then(data => {
        this.user = data.userDetails
        this.users = data.usersList
        this.myFriends = data.friends
        this.fromFriendRequestPending = data.fromFriendRequestPending
        this.toFriendRequestPending = data.toFriendRequestPending
      })
      .catch(e => {
        console.log('error fetching userlist', e)
      })
  }
}

export default UserDashboardController
