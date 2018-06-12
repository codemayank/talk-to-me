/**
 * userdashboard.js module
 */

import angular from 'angular'
import userDashboardComponent from './userdasboard.component'

//define the userdashboard module
const UserDashboardModule = angular
  .module('userDashboard', [])
  .component('userDashboard', userDashboardComponent)

export default UserDashboardModule
