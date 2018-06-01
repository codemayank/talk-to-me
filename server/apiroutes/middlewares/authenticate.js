module.exports.AuthCheck = function(req, res, next) {
  if (!req.isAuthenticated()) {
    //executes if user is not logged in.

    res.status(401).send('unauthorised')
  } else {
    //if logged in.

    next()
  }
}
