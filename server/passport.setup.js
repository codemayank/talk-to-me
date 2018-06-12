const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const LocalStrategy = require('passport-local')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const User = require('./apiroutes/user/user.model')

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user)
  })
})
passport.use(
  new GoogleStrategy(
    {
      //optopm fpr the google strategy.
      callbackURL: '/user/auth/google/redirect',
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    (accessToken, refreshToken, profile, done) => {
      //passport callback function

      //check if use already exists in our database.
      User.findOne({ google_id: profile.id }).then(currentUser => {
        if (currentUser) {
          //already found user
          console.log('found user in database', currentUser)
          done(null, currentUser)
        } else {
          //create a new user in db
          new User({
            username: profile.displayName,
            google_id: profile.id,
            email: profile.emails[0].value
          })
            .save()
            .then(newUser => {
              done(null, newUser)
            })
        }
      })
    }
  )
)
//new local strategy for authentication
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    (email, password, done) => {
      return User.findByCredentials(email, password)
        .then(user => {
          return done(null, user)
        })
        .catch(err => {
          return done(err)
        })
    }
  )
)

let sessionMiddleware = session({
  secret: process.env.COOKIE_KEY,
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    url: process.env.MONGODB_URI
  })
})
module.exports = { sessionMiddleware }
