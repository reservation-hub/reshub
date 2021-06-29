const router = require('express').Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { login } = require('./utils')
const UserRepository = require('../../repositories/userRepository')

passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  const user = await UserRepository.findByProps({ email: username })
  if (!user || !bcrypt.compareSync(password, user.password)) return done(null, false, { message: 'Authentication failed' })
  return done(null, user)
}))

router.post('/login', passport.authenticate('local'), login)

router.get('/logout', async (req, res, next) => {
  req.logout()
  delete req.session.user
  res.send({ message: 'logged out!' })
})

module.exports = router