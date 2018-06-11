class HomeComponentController {
  constructor(UserService, $scope, $location) {
    'ngInject'
    this.appTitle = 'Talk-To-Me!'
    this.userService = UserService
    this.location = $location
    this.scope = $scope
  }

  onUserRegister() {
    if (this.reg.password === this.reg.confirmPassword) {
      this.regForm.password = this.reg.password
      this.userService
        .registerUser(this.regForm)
        .then(data => {
          console.log('logging user data', data)
          this.location.path('/user/dashboard')
        })
        .catch(e => {
          console.log('error registering user', e)

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
      console.log('passwords not matching', this.errorDisp)
      setTimeout(() => {
        this.errorDisp = null
        this.scope.$apply()
      }, 5000)
    }
  }

  onUserLogin() {
    this.userService
      .loginUser(this.loginForm)
      .then(data => {
        console.log('user logged in', data)
        this.location.path('/user/dashboard')
      })
      .catch(e => {
        console.log('errorin authenticating the user', e)
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
