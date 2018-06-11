import angular from 'angular'
import ngRoute from 'angular-route'
import '../../node_modules/material-design-lite/material.min.css'
import '../../node_modules/material-design-lite/material'
import '../main.css'
import moment from 'moment'
import angularMoment from 'angular-moment'
import routes from './configuration/routes'
import routeAuthCheck from './configuration/routeauthcheck'
import HomeComponent from './pages/home/home'
import ForgotPasswordComponent from './pages/forgotpassword/forgotpassword'
import UserDashboardComponent from './pages/userdashboard/userdashboard'
import UserService from './services/user.service'
import FriendService from './services/friend.service'
import userDashboardComponent from './pages/userdashboard/userdashboard'
import chatUiComponent from './pages/chatui/chatui'
// import angularLoadingBar from 'angular-loading-bar'
// import '../../node_modules/angular-loading-bar/build/loading-bar.min.css'

angular
  .module('app', [
    ngRoute,
    angularMoment,
    // angularLoadingBar,
    HomeComponent.name,
    ForgotPasswordComponent.name,
    userDashboardComponent.name,
    chatUiComponent.name
  ])
  .factory('UserService', ['$http', '$q', UserService])
  .factory('FriendService', ['$http', '$q', FriendService])

  .config(routes)
  .run(routeAuthCheck)
