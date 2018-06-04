function FriendService($http, $q) {
  'ngInject'
  return {
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
