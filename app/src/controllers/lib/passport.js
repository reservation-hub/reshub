const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const UserRepository = require('../../repositories/UserRepository')

// JWT

const cookieExtractor = req => {
  let headerToken
  if (req.get('authorization')) {
    // eslint-disable-next-line prefer-destructuring
    headerToken = req.get('authorization').split(' ')[1]
  }
  if (!headerToken) return null

  let authToken
  if (req.signedCookies) {
    authToken = req.signedCookies.authToken
  }
  if (!authToken) return null
  if (req && authToken && headerToken && authToken === headerToken) {
    return authToken
  }
  return null
}

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_TOKEN_SECRET,
  audience: 'http://localhost:8080',
  expiresIn: '1d',
  issuer: process.env.RESHUB_URL,
}

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    if (!jwtPayload.user) console.error('NO USER IN PAYLOAD')
    const { error, value: user } = await UserRepository.findByProps({ id: jwtPayload.user.id })
    if (error || !user) return done({ code: 404, message: 'User does not exist', error }, null)
    delete user.password
    return done(null, user)
  } catch (e) { return done(e, null) }
}))

// local

passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  if (!username || !password) return done({ code: 400, message: 'メールアドレス、もしくはパスワードが間違っています' }, null)
  const { error, value: user } = await UserRepository.findByProps({ email: username })
  if (error || !bcrypt.compareSync(password, user.password)) return done({ code: 400, message: 'メールアドレス、もしくはパスワードが間違っています', error }, null)
  delete user.password
  return done(null, user)
}))

module.exports = passport
