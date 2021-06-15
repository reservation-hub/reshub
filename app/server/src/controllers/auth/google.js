const router = require('express').Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const { User } = require('../../models/user')
const { login, passportData } = require('./utils')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.RESHUB_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({googleID: profile.id}).or([{email: profile.emails[0].value}]).exec()
    if (!user) return done({ code: 404, message: "User not found", data: passportData(profile) })
    return done(null, user)
  } catch (e) {
    done(e, null)
  }
}))

router.get('/', passport.authenticate('google', { scope: ['email', 'profile']}))

router.get('/callback', passport.authenticate('google'), login)

module.exports = router