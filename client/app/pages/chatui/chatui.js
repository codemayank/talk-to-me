import angular from 'angular'

import chatUiComponent from './chatui.component'

const chatUiModule = angular
  .module('chatUi', [])
  .component('chatUi', chatUiComponent)

export default chatUiModule
