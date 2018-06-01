/**
 * Main Server Index File
 */

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const log = require('./logger')
const userRoutes = require('./apiroutes/user/user.routes')
const mongoose = require('mongoose')

//connect to database
mongoose.connect(process.env.DATABASE_URL)

//setup express app
const app = express()
const port = process.env.PORT || 5000

//configure body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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

//Mount models
const User = require('./apiroutes/user/user.model')

//Mount routes
app.use('/user', userRoutes)

//start the app
app.listen(port, () => {
  log.info(`Server listening at port ${port}`)
})
