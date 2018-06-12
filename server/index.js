/**
 * Main Server Index File
 */

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const log = require('./logger')
const userRoutes = require('./apiroutes/user/user.routes')
const friendShipRoutes = require('./apiroutes/friendships/friendship.routes')
const mongoose = require('mongoose')

//connect to database
mongoose.connect(process.env.MONGODB_URI)

//setup express app
const app = express()
const http = require('http').createServer(app)
const port = process.env.PORT || 5000

//configure body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//configure client
const publicPath = path.join(__dirname, '../dist')
app.use(express.static(publicPath))

//configure passport
const passport = require('passport')
const passportSetup = require('./passport.setup')
app.use(passportSetup.sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

//log all requests
app.use(async (req, res, next) => {
  const start = Date.now()
  await next() //this will pause the function until the endpoint handler has resolved.
  const responseTime = Date.now() - start
  log.info(`${req.method} ${res.statusCode} ${req.url} - ${responseTime}`)
})

//Error handler - all uncaught exceptions will percolate up to here
app.use(async (req, res, next) => {
  try {
    await next()
  } catch (err) {
    res.status = err.status || 500
    res.body = err.message
    log.error(`Request Error ${res.url} - ${err.message}`)
  }
})

//Mount models
const User = require('./apiroutes/user/user.model')

//Mount routes
app.use('/user', userRoutes)
app.use('/friendship', friendShipRoutes)

//start the app
http.listen(port, () => {
  log.info(`Server listening at port ${port}`)
})

const chatSockets = require('./sockets/chat.sockets')
chatSockets.controller(http)
module.exports = { app }
