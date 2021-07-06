const router = require('express').Router()
const passport = require('passport')
const TwitterStrategy = require('passport-twitter-oauth2')
const UserRepository = require('../../repositories/userRepository')
const { login, passport404Error } = require('./utils')

passport.use(new TwitterStrategy({
  clientID: process.env.TWITTER_API_APP_ID,
  clientToken: process.env.TWITTER_API_ACCESS_TOKEN,
  clientSecret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET,
  callbackURL: `${process.env.RESHUB_URL}/auth/twitter/callback`,
  includeEmail: true,
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await UserRepository.findByProps([{ twitterID: profile.id }, { email: profile.emails[0].value }])
    console.log('test twitter', user)
    if (!user) return done(passport404Error(profile))
    
    // ユーザー情報がDBにあったらIDをユーザー情報に追加する
    user = await UserRepository.addIdFromPassportProfile(user, profile)

    return done(null, user)
  } catch (e) {
    done(e, null)
  }
}))

router.get('/', (req, res, next) => {
  console.log("twitter")
  return next()
}, passport.authenticate('twitter'))

router.get('/callback', passport.authenticate('twitter'), login)

module.exports = router