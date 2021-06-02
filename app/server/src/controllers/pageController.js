const express = require('express')
const router = express.Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const { User } = require('../models/user')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8090/auth/google/callback",
}, async (accessToken, refreshToken, profile, cb) => {
  let user = await User.find({googleID: profile.id}).exec()
  if (!user.length) {
    user = new User({googleID: profile.id, firstName: profile.name.givenName, lastName: profile.name.familyName, email: profile.emails[0].value})
    user.save()
  }
  return cb(null, profile)
  // return cb(null, user)
}))

const pages = {
  'shops': 'shop',
  'prefectures': 'prefecture',
  'areas': 'area',
  'cities': 'city'
}

const index = (pages) => {
  return (req, res, next) => {
    console.log('user', req.user)
    res.send({pages, session: req.session, user: req.user || {}, authenticated: req.isAuthenticated()})
  }
}

// index
router.get('/', index(pages))

router.get('/logout', (req, res, next) => {
  req.logout()
  console.log(req.user())
  res.redirect('/')
})

router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile']}))

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/fail' }),
  (req, res, next) => {
    console.log('req user : ', req.user)
    res.redirect('/')
  }
)

module.exports = router