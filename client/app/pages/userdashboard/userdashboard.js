import angular from 'angular'
import userDashboardComponent from './userdasboard.component'

const UserDashboardModule = angular
  .module('userDashboard', [])
  .component('userDashboard', userDashboardComponent)

export default UserDashboardModule
