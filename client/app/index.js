import angular from 'angular'
import ngRoute from 'angular-route'
import '../../node_modules/material-design-lite/material.min.css'
import '../../node_modules/material-design-lite/material'
import '../main.css'
import routes from './configuration/routes'
import routeAuthCheck from './configuration/routeauthcheck'
import HomeComponent from './pages/home/home'
import ForgotPasswordComponent from './pages/forgotpassword/forgotpassword'
import UserService from './services/user.service'

angular
  .module('app', [ngRoute, HomeComponent.name, ForgotPasswordComponent.name])
  .factory('UserService', [UserService])
  .config(routes)
  .run(routeAuthCheck)
