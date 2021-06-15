const router = require('express').Router()
const passport = require('passport')
const TwitterStrategy = require('passport-twitter')
const { User } = require('../../models/user')
const { login, passportData } = require('./utils')

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET_KEY,
  callbackURL: `${process.env.RESHUB_URL}/auth/twitter/callback`,
  includeEmail: true,
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findOne({twitterID: profile.id}).or([{email: profile.emails[0].value}]).exec()
    if (!user) return done({ code: 404, message: "User not found", data: passportData(profile) })
    return done(null, user)
  } catch (e) {
    done(e, null)
  }
}))

router.get('/', passport.authenticate('twitter'))

router.get('/callback', passport.authenticate('twitter'), login)

module.exports = router