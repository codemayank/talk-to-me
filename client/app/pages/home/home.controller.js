class HomeComponentController {
  constructor(UserService, $location) {
    'ngInject'
    this.appTitle = 'Talk-To-Me!'
    this.userService = UserService
    this.location = $location
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
        })
    } else {
      this.showRegFormError = 'Passwords do not match please try again!'
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
      })
  }
}

export default HomeComponentController
