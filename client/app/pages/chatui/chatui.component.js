/**
 * chat ui component module
 */

import controller from './chatui.controller'
import template from './chatui.html'

//define the chat ui component
let chatUiComponent = {
  bindings: {},
  template,
  controller,
  controllerAs: 'vm'
}

export default chatUiComponent
