/**
 *  friend service
 */

function FriendService($http, $q) {
  'ngInject'
  return {
    //service function to send friend request data to server
    sendFriendRequest(friendId) {
      let deferred = $q.defer()
      $http({
        method: 'POST',
        url: '/friendship/friend-request',
        data: {
          friendId: friendId
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

    //service function to send friend request cancellation request to server
    cancelFriendRequest(friendId) {
      let deferred = $q.defer()
      $http({
        method: 'GET',
        url: '/friendship/friend-request/cancel/' + friendId
      })
        .then(response => {
          deferred.resolve(response.data)
        })
        .catch(e => {
          deferred.reject(e)
        })
      return deferred.promise
    },

    //service function to send friend request acceptance request to the server
    acceptFriendRequest(friendId) {
      let deferred = $q.defer()
      $http({
        method: 'GET',
        url: '/friendship/friend-request/accept/' + friendId
      })
        .then(response => {
          deferred.resolve(response.data)
        })
        .catch(e => {
          deferred.reject(e)
        })
      return deferred.promise
    }
  }
}

export default FriendService
