import angular from 'angular'
import '../../../../node_modules/angularjs-scroll-glue/src/scrollglue'

import chatUiComponent from './chatui.component'

const chatUiModule = angular
  .module('chatUi', ['luegg.directives'])
  .component('chatUi', chatUiComponent)

export default chatUiModule
