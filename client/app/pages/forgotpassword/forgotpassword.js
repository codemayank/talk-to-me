/**
 * forgot password module
 */

import angular from 'angular'
import forgotPasswordComponent from './forgotpassword.component'

//define the forgot password module
const forgotPasswordModule = angular
  .module('forgotPassword', [])
  .component('forgotPassword', forgotPasswordComponent)

export default forgotPasswordModule
