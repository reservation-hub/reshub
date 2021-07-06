const router = require('express').Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const UserRepository = require('../../repositories/userRepository')
const { login, passport404Error } = require('./utils')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.RESHUB_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await UserRepository.findByProps([{ googleID: profile.id }, { email: profile.emails[0].value }])
    if (!user) return done(passport404Error(profile))

    // ユーザー情報がDBにあったらIDをユーザー情報に追加する
    user = await UserRepository.addIdFromPassportProfile(user, profile)
    return done(null, user)
  } catch (e) {
    done(e, null)
  }
}))

router.get('/', passport.authenticate('google', { scope: ['email', 'profile'] }))

router.get('/callback', passport.authenticate('google', { session: false }), login)

module.exports = router