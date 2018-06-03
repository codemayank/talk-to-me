const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const validator = require('validator')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const _ = require('lodash')

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid e-mail'
    }
  },
  password: {
    type: String,
    minlength: 6
  },
  google_id: {
    type: String
  },

  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }
  ],

  resetPasswordToken: String,
  resetPasswordExpires: Date
})
userSchema.methods.toJSON = function() {
  let user = this.toObject()
  delete user['password']
  return user
}

userSchema.pre('save', function(next) {
  let user = this
  if (!user.isModified('password')) {
    return next()
  }
  bcrypt.genSalt(10, (err, salt) => {
    let password = user.password
    bcrypt.hash(password, salt, (err, hash) => {
      user.password = hash
      return next()
    })
  })
})

userSchema.statics.findByCredentials = function(email, password) {
  let User = this
  return User.findOne({
    email
  }).then(user => {
    if (!user) {
      return Promise.reject('Loginerr1')
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user)
        } else {
          console.log('user not found')
          let message = 'Loginerr2'
          reject(message)
        }
      })
    })
  })
}

userSchema.statics.createResetPasswordToken = function(email, host) {
  if (process.env.USE_EMAIL) {
    let User = this
    let buf = crypto.randomBytes(20)
    let token = buf.toString('hex')
    return User.findOne({
      email: email
    })
      .then(user => {
        if (!User) {
          return Promise.reject(`no User with email-id ${email} exists`)
        }
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000
        return user.save().then(() => {
          return user
        })
      })
      .then(user => {
        let smtpTransport = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE,
          auth: {
            user: process.env.EMAIL_USER_NAME,
            pass: process.env.EMAIL_PASSWORD
          }
        })
        let mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Password reset',
          text:
            'Password Reset Mail \n\n' +
            'Click on the below link to reset your password\n\n' +
            'http://' +
            host +
            '/user/reset-password/' +
            token
        }
        return smtpTransport.sendMail(mailOptions).then(() => {
          return {
            message: 'email sent.'
          }
        })
      })
      .catch(e => {
        console.log('error in redet password', e)
      })
  } else {
    return 'email service has been disabled. so password reset cannot be used.'
  }
}
userSchema.statics.changePassword = function(token, newPassword) {
  if (process.env.USE_EMAIL) {
    let User = this
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    })
      .then(user => {
        if (!user) {
          return Promise.reject(
            'password reset token is invalid or has expired.'
          )
        }
        user.password = newPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        return user.save().then(() => {
          return user
        })
      })
      .then(user => {
        let smtpTransport = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE,
          auth: {
            user: process.env.EMAIL_USER_NAME,
            pass: process.env.EMAIL_PASSWORD
          }
        })
        let mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Your Password has been changed',
          text: 'Your password has been changed successfully'
        }
        return smtpTransport.sendMail(mailOptions).then(() => {
          return { message: 'password successfully changed.' }
        })
      })
  } else {
    return 'email service has been disabled. so password reset cannot be used.'
  }
}

module.exports = mongoose.model('User', userSchema)
