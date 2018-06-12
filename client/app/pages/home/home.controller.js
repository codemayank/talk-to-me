/**
 * Home component controller
 */

class HomeComponentController {
  constructor(UserService, $scope, $location) {
    'ngInject'
    this.appTitle = 'Talk-To-Me!'
    this.userService = UserService
    this.location = $location
    this.scope = $scope
  }
  //handle new user registration
  onUserRegister() {
    if (this.reg.password === this.reg.confirmPassword) {
      this.regForm.password = this.reg.password
      this.userService
        .registerUser(this.regForm)
        .then(data => {
          this.location.path('/user/dashboard')
        })
        .catch(e => {
          let re2 = /email_1/g

          if (e.data.errmsg && re2.test(e.data.errmsg)) {
            this.errorDisp = 'That email address is already registered!'
            setTimeout(() => {
              this.errorDisp = null
              this.scope.$apply()
            }, 5000)
          }
        })
    } else {
      this.errorDisp = 'Passwords do not match please try again!'

      setTimeout(() => {
        this.errorDisp = null
        this.scope.$apply()
      }, 5000)
    }
  }

  //handle user login
  onUserLogin() {
    this.userService
      .loginUser(this.loginForm)
      .then(data => {
        this.location.path('/user/dashboard')
      })
      .catch(e => {
        if (e.status === 401 || e.status === 500) {
          this.errorDisp = 'Incorrect email address or password!'
          setTimeout(() => {
            this.errorDisp = null
            this.scope.$apply()
          }, 5000)
        }
      })
  }
}

export default HomeComponentController
