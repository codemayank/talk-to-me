/**
 * user service module
 */

function UserService($http, $q) {
  'ngInject'
  let user = null
  return {
    //check if the user is logged in
    isLoggedIn() {
      if (user) {
        return true
      } else {
        return false
      }
    },

    //get user status from the server
    getUserStatus() {
      return $http({ method: 'GET', url: '/user/status' })
        .then(response => {
          user = true
        })
        .catch(error => {
          user = false
        })
    },

    //register user to the server
    registerUser(credentials) {
      let deferred = $q.defer()

      $http({
        method: 'POST',
        url: '/user/register',
        data: credentials
      })
        .then(response => {
          deferred.resolve(response.data)
        })
        .catch(e => {
          deferred.reject(e)
        })

      return deferred.promise
    },

    //login user on the server
    loginUser(credentials) {
      let deferred = $q.defer()

      $http({
        method: 'POST',
        url: '/user/login',
        data: credentials
      })
        .then(response => {
          deferred.resolve(response.data)
        })
        .catch(e => {
          deferred.reject(e)
        })
      return deferred.promise
    },
    //submit user email to server for forgot password
    forgotPassword(credentials) {
      let deferred = $q.defer()

      $http({
        method: 'POST',
        url: '/user/forgot-password',
        data: credentials
      })
        .then(response => {
          deferred.resolve(response.data)
        })
        .catch(e => {
          deferred.reject(e)
        })

      return deferred.promise
    },
    //reset password
    resetPassword(credentials, url) {
      let deferred = $q.defer()
      $http({
        method: 'POST',
        url: url,
        data: {
          newPassword: credentials
        }
      })
        .then(response => {
          deferred.resolve(response.data)
        })
        .catch(e => {
          deferred.reject(e)
        })

      return deferred.promise
    },

    logout() {
      let deferred = $q.defer()
      $http
        .get('/user/logout')
        .then(response => {
          deferred.resolve(response)
        })
        .catch(e => {
          deferred.reject(e)
        })
      return deferred.promise
    },
    //user service function to get all the data required on user dashboard
    getDashboardData() {
      let deferred = $q.defer()

      $http
        .get('/user/details')
        .then(response => {
          console.log(response)
          let usersList = response.data.usersList
          let userDetails = response.data.user
          let friendShips = response.data.friendShips
          let friends = []
          let fromFriendRequestPending = []
          let toFriendRequestPending = []
          for (let i = 0; i < friendShips.length; i++) {
            if (friendShips[i].confirmed) {
              friends.push(friendShips[i])
            } else if (
              !friendShips[i].confirmed &&
              friendShips[i].friend1._id === userDetails._id
            ) {
              fromFriendRequestPending.push(friendShips[i])
            } else if (
              !friendShips[i].confirmed &&
              friendShips[i].friend2._id === userDetails._id
            ) {
              toFriendRequestPending.push(friendShips[i])
            }
          }
          deferred.resolve({
            usersList,
            userDetails,
            friends,
            fromFriendRequestPending,
            toFriendRequestPending
          })
        })
        .catch(e => {
          deferred.reject(e)
        })
      return deferred.promise
    }
  }
}

export default UserService
