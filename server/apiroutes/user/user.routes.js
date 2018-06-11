/**
 * User Routes Module
 */

const router = require('express').Router()
const passport = require('passport')
const User = require('./user.model')
const _ = require('lodash')
const authenticate = require('../middlewares/authenticate').AuthCheck
const log = require('../../logger')
const FriendShip = require('../friendships/friendship.model')

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
    res.redirect('/#!/user/dashboard')
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
        return res.status(401).send({ err })
      } else {
        return res.status(500).send({ err })
      }
    }
    if (!user) {
      return res.status(401).send({ info })
    }
    req.logIn(user, err => {
      if (err) {
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
  res.redirect('/#!/reset-password/' + req.params.token)
})
router.post('/reset-password/:token', (req, res) => {
  User.changePassword(req.params.token, req.body.newPassword)
    .then(() => {
      res.send('password changed successfully')
    })
    .catch(e => {
      res.status(400).send()
    })
})

router.get('/status', authenticate, (req, res) => {
  res.status(200).send(true)
})

router.get('/details', authenticate, (req, res) => {
  //fetch all of users friends from the db
  FriendShip.find({
    $or: [{ friend1: req.user._id }, { friend2: req.user._id }]
  })
    .populate('friend1 friend2', 'username')

    .then(friendships => {
      let friendShips = friendships

      return User.find({}, 'username') //fetch all the users registered on the app
        .lean()
        .then(users => {
          //remove the requesting user from this list
          users.splice(
            users.findIndex(
              x => x._id.toHexString() === req.user._id.toHexString()
            ),
            1
          )
          let usersList = users

          friendShips.forEach(friendShip => {
            //remove all the users confirmed and unconfirmed friends from the users list.
            users.forEach(user => {
              if (
                friendShip.friend1._id.toHexString() ===
                  user._id.toHexString() ||
                friendShip.friend2._id.toHexString() === user._id.toHexString()
              ) {
                usersList.splice(
                  usersList.findIndex(x => x._id === user._id),
                  1
                )
              }
            })
          })
          //get all of users notifications
          User.populate(req.user, { path: 'notifications' }).then(user => {
            res.send({
              usersList: usersList,
              friendShips: friendShips,
              user: req.user
            })
          })
        })
    })
    .catch(e => {
      log.error('error getting friend list for user', e)
    })
})

// router.get('/user-list', authenticate, (req, res) => {
//   User.find({}, 'username email')
//     .lean()
//     .then(userList => {
//       userList.splice(userList.findIndex(x => x._id == req.user._id), 1)

//       res.send({ userList })
//     })
//     .catch(e => {
//       log.error('error getting user list', e)
//     })
// })
module.exports = router
