const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const UserRepository = require('../repositories/userRepository')

// Google

const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.RESHUB_URL}/auth/google/callback`,
}

passport.use(new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await UserRepository.findByProps([
      { googleID: profile.id },
      { email: profile.emails[0].value },
    ])
    if (!user) return done({ code: 404, message: 'User not found' })
    if (user.roles.findIndex(role => role.name === 'admin') === -1) return done({ code: 403, message: 'Unauthorized Access' })
    // ユーザー情報がDBにあったらIDをユーザー情報に追加する
    user = await UserRepository.addIdFromPassportProfile(user, profile)
    return done(null, user)
  } catch (e) {
    return done(e, null)
  }
}))

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
    const user = await UserRepository.findByProps({ _id: jwtPayload.user._id })
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
