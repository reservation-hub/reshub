const router = require('express').Router()
const passport = require('passport')
const LineStrategy = require('passport-line-auth')
const { User } = require('../../models/user')
const { login, passportData } = require('./utils')
const jwt = require('jsonwebtoken')

passport.use(new LineStrategy({
  channelID: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  callbackURL: `${process.env.RESHUB_URL}/auth/line/callback`,
  scope: ['profile', 'openid', 'email',],
  botPrompt: 'normal',
  uiLocales: 'en-US',
}, async (token, tokenSecret, params, profile, done) => {
  try {
    profile.email = email
    let user = await User.findOne({lineID: profile.id}).or([{email}]).exec()
    if (!user) return done({ code: 404, message: "User not found", data: passportData(profile) })
    return done(null, user)
  } catch (e) {
    done(e, null)
  }
}))

router.get('/', passport.authenticate('line'))

router.get('/callback', passport.authenticate('line'), login)

module.exports = router