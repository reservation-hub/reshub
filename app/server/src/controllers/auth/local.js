const router = require('express').Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { validationSchema: validator, User } = require('../../models/user')
const { login } = require('./utils')

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await User.findOne({username}).exec()
  if (!user || !bcrypt.compareSync(password, user.password)) return done(null, false, { message: 'Authentication failed' })
  return done(null, user)
}))

router.post('/login', passport.authenticate('local'), login)

router.post('/signup', async (req, res, next) => {
  const { value, error } = validator.validate(req.body)
  if (error) return next(error)

  if (value.password !== value.confirm) return next({code: 400, message: "Password did not match!"})
  delete value.confirm

  const duplicate = await User.findOne({username: value.username}).or([{email: value.email}]).exec()
  if (duplicate) return next({code: 400, message: "Username / Email is already taken"})
  
  const hash = bcrypt.hashSync(value.password, saltRounds = 10)
  value.password = hash

  const user = new User(value)
  user.save()
  
  req.logIn(user, (err) => {
    if (err) return next(err)
    return res.send({})
  })
})

module.exports = router