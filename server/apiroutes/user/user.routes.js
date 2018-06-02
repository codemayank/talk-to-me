/**
 * User Routes Module
 */

const router = require('express').Router()
const passport = require('passport')
const User = require('./user.model')
const _ = require('lodash')
const authenticate = require('../middlewares/authenticate').AuthCheck
const log = require('../../logger')

router.get(
  '/signin/google',
  passport.authenticate(
    'google',
    { scope: ['profile', 'email'] },
    (req, res) => {
      res.header('Access-Control-Allow-Origin', '*').send()
    }
  )
)

router.get(
  '/auth/google/redirect',
  passport.authenticate('google'),
  (req, res) => {
    console.log(req.user)
    res.redirect('/user/welcome')
  }
)

router.get('/welcome', (req, res) => {
  res.send('hello you have registered using google.')
})

router.post('/register', (req, res) => {
  if (req.body.username && req.body.email && req.body.password) {
    let newUser = new User(_.pick(req.body, ['username', 'email', 'password']))
    newUser.save(err => {
      if (err) {
        return res.status(400).send(err)
      }
      res.send('registration successful')
      req.logIn(newUser, err => {
        if (err) {
          return res.status(401).send(err)
        }
        return res.status(200).send(req.user)
      })
    })
  } else {
    return res.status(400).send('Some fields missing')
  }
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      if (err === 'Loginerr2') {
        console.log('returning error from 401 block', err)
        return res.status(401).send({ err })
      } else {
        console.log('returning error from 500 block', err)
        return res.status(500).send({ err })
      }
    }
    if (!user) {
      console.log(info)
      return res.status(401).send({ info })
    }
    req.login(user, err => {
      if (err) {
        console.log('returning error from 500 block', err)
        return res.status(500).send({ err })
      }
      //redirect use to #!/testdashboard
      return res.status(200).send(req.user)
    })
  })(req, res, next)
})

router.get('/logout', authenticate, (req, res) => {
  //log user out from the network;
  req.logout()
  res.send('loggedout')
})

router.post('/forgot-password', (req, res) => {
  User.createResetPasswordToken(req.body.email, req.headers.host)
    .then(() => {
      res.send('an email has been sent to your registered email address for ')
    })
    .catch(e => {
      res.status(400).send(e)
    })
})
router.get('/reset-password/:token', (req, res) => {
  res.redirect(
    '/#!/reset-password/' + req.params.token + '/' + req.params.userType
  )
})
router.post('/reset-password/:token', (req, res) => {
  console.log(req.body)

  User.changePassword(req.params.token, req.body.newPassword)
    .then(() => {
      res.send('password changed successfully')
    })
    .catch(e => {
      console.log('error in changing the password', e)
      res.status(400).send()
    })
})

/**
 * Friend Management system APIs
 */

router.get('/user-list', authenticate, (req, res) => {
  User.find({})
    .then(userList => {
      res.send({ userList })
    })
    .catch(e => {
      log.error('error getting user list', e)
    })
})

module.exports = router
