const router = require('express').Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { login } = require('./utils')
const UserRepository = require('../../repositories/userRepository')
const { validationSchema: validator } = require('../../models/user')

passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  const user = await UserRepository.findByProps({ email: username })
  if (!user || !bcrypt.compareSync(password, user.password)) return done(null, false, { message: 'Authentication failed' })
  return done(null, user)
}))

router.post('/login', passport.authenticate('local', { session: false }), login)

router.get('/logout', async (req, res, next) => {
  req.logout()
  delete req.session.user
  res.send({ message: 'logged out!' })
})

router.post('/signup', async (req, res, next) => {
  const { value, error } = validator.validate(req.body)
  if (error) return next(error)

  if (value.password !== value.confirm) return next({ code: 400, message: "Password did not match!" })
  delete value.confirm
  
  const duplicate = await UserRepository.findByProps([{ email: value.email }, { username: value.username }])
  if (duplicate) return next({code: 400, message: "Username / Email is already taken"})
  
  const hash = bcrypt.hashSync(value.password, saltRounds = 10)
  value.password = hash

  const user = await UserRepository.create(value)
  
  req.logIn(user, (err) => {
    if (err) return next(err)
    return res.send(user)
  })
})
module.exports = router