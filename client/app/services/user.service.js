function UserService($http, $q) {
  'ngInject'
  return {
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

    forgotPassword(credentials) {
      console.log(credentials)
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
    }
  }
}

export default UserService
