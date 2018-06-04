class ForgotPasswordController {
  constructor(UserService, $routeParams, $location) {
    'ngInject'
    this.userService = UserService
    this.routeParams = $routeParams
    this.location = $location
  }

  $onInit() {
    console.log(this.routeParams)
    if (this.routeParams.token === 'noToken') {
      this.showForgotPasswordForm = true
    } else {
      this.showForgotPasswordForm = false
    }
  }

  onEmailSubmit() {
    this.userService
      .forgotPassword(this.forgotPasswordForm)
      .then(data => {
        console.log(data)
      })
      .catch(e => {
        console.log('on email submit', e)
      })
  }

  onNewPasswordSubmit() {
    if (this.resetPassword.password === this.resetPassword.confirmPassword) {
      let url = '/user/reset-password/' + this.routeParams.token
      this.userService
        .resetPassword(this.resetPassword.password, url)
        .then(data => {
          console.log(data)
          this.location.path('/#!')
        })
        .catch(e => {
          console.log('logging error in new password submit', e)
        })
    } else {
      this.resetPasswordError = 'The two passwords do not match'
      console.log(this.resetPasswordError)
    }
  }
}

export default ForgotPasswordController
