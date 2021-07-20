const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const UserRepository = require('../../repositories/userRepository')

// JWT

const cookieExtractor = req => {
  let headerToken
  if (req.get('authorization')) {
    // eslint-disable-next-line prefer-destructuring
    headerToken = req.get('authorization').split(' ')[1]
  }
  if (!headerToken) console.error('HEADER TOKEN : ', headerToken)

  let authToken
  if (req.signedCookies) {
    authToken = req.signedCookies.authToken
  }
  if (!authToken) console.error('AUTH TOKEN : ', authToken)
  // eslint-disable-next-line no-console
  console.log(authToken)
  // eslint-disable-next-line no-console
  console.log(headerToken)
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
    // eslint-disable-next-line no-console
    console.log('jwtPayload : ', jwtPayload)
    if (!jwtPayload.user) console.error('NO USER IN PAYLOAD')
    // eslint-disable-next-line no-underscore-dangle
    const user = await UserRepository.findByProps({ id: jwtPayload.user.id })
    // eslint-disable-next-line no-console
    console.log('USER : ', user)
    if (!user) return done('Unauthorized')
    return done(null, user)
  } catch (e) { return done(e, null) }
}))

// local

passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  const user = await UserRepository.findByProps({ email: username })
  if (!user || !bcrypt.compareSync(password, user.password)) return done(null, false, { message: 'Authentication failed' })
  return done(null, user)
}))

module.exports = passport
