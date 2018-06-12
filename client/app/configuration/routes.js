/**
 * routes configuration
 */

function routes($routeProvider, $locationProvider) {
  'ngInject'
  $routeProvider
    .when('/home', {
      template: '<home></home>',
      access: {
        restricted: false
      }
    })
    .when('/user/dashboard', {
      template: '<user-dashboard></user-dashboard>',
      access: {
        restricted: true
      }
    })
    .when('/reset-password/:token', {
      template: '<forgot-password></forgot-password>',
      access: {
        restricted: false
      }
    })
    .otherwise({
      redirectTo: '/home',
      access: {
        restricted: false
      }
    })
}

export default routes
