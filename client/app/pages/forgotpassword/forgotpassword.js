import angular from 'angular'
import forgotPasswordComponent from './forgotpassword.component'

const forgotPasswordModule = angular
  .module('forgotPassword', [])
  .component('forgotPassword', forgotPasswordComponent)

export default forgotPasswordModule
