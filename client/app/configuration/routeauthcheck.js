//function to check if the user is logged in before loading a restricted route
function authRouteCheck($rootScope, $location, $route, $timeout, UserService) {
  'ngInject'
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    if (next.access.restricted) {
      UserService.getUserStatus().then(() => {
        if (!UserService.isLoggedIn()) {
          $location.path('/')
          $route.reload()
        }
      })
    }
  })
  $rootScope.$on('$viewContentLoaded', () => {
    $timeout(() => {
      componentHandler.upgradeAllRegistered()
    })
  })
}

export default authRouteCheck
