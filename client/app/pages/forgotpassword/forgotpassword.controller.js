/**
 * Forgot password controller
 */

class ForgotPasswordController {
  constructor(UserService, $scope, $routeParams, $location) {
    'ngInject'
    this.userService = UserService
    this.routeParams = $routeParams
    this.location = $location
    this.scope = $scope
    this.emailSent = false
    this.passwordResetSuccess = false
  }

  $onInit() {
    //on initialisation of the component check if token exists in the url to load appropriate page
    if (this.routeParams.token === 'noToken') {
      this.showForgotPasswordForm = true
    } else {
      this.showForgotPasswordForm = false
    }
  }
  //function to submit the email to the server requesting token for new password
  onEmailSubmit() {
    this.userService
      .forgotPassword(this.forgotPasswordForm)
      .then(data => {
        this.emailSent = true
      })
      .catch(e => {
        this.resetPasswordError = true
        setTimeout(() => {
          this.resetPasswordError = false
          this.scope.$apply()
        }, 10000)
      })
  }
  //function to submit new password to server to change password
  onNewPasswordSubmit() {
    if (this.resetPassword.password === this.resetPassword.confirmPassword) {
      let url = '/user/reset-password/' + this.routeParams.token
      this.userService
        .resetPassword(this.resetPassword.password, url)
        .then(data => {
          this.passwordResetSuccess = true
          this.resetPassword.password = ''
          this.resetPassword.confirmPassword = ''
        })
        .catch(e => {
          this.resetPasswordError = true
          setTimeout(() => {
            this.resetPasswordError = false
            this.scope.$apply()
          }, 10000)
        })
    } else {
      this.passwordNotMatch = true
      setTimeout(() => {
        this.passwordNotMatch = false
        this.scope.$apply()
      }, 10000)
    }
  }
}

export default ForgotPasswordController
