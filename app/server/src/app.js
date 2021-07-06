const express = require('express')
const cors = require('cors')
const db = require('./db/mongoose')
const session = require('express-session')
const passport = require('passport')
const helmet = require('helmet')
const { errorHandler } = require('../lib/errorHandler')

// session management
const redis = require('redis')
const redisClient = redis.createClient({ host: "redis" })
const redisStore = require('connect-redis')(session)
redisClient.on('error', err => {
    console.log('Redis error : ', err)
})

const app = express()

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
    require('./models/user').User.findById(_id)
    .then(user => done(null, user))
    .catch(e => done(e, null))
});

app.use(express.json())
if (process.env.NODE_ENV === 'development') {
  app.use(cors())
}
app.use(helmet())
app.use(passport.initialize());
app.use(passport.session());
require('./routes')(app)
app.use(errorHandler)

module.exports = app