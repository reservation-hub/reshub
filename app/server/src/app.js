const express = require('express')
const cors = require('cors')
const db = require('./db/mongoose')
const session = require('express-session')
const passport = require('passport')
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
app.use(cors())
app.use(session({
    secret: 'reservation hub',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true, maxAge: 60 * 60 * 1000 }, /* commented out because since it's not yet running on https, we can't use secure: true*/
    cookie: { maxAge: 60 * 60 * 1000 },
    store: new redisStore({ client: redisClient })
}))
app.use(passport.initialize());
app.use(passport.session());
require('./routes')(app)
app.use(errorHandler)

app.listen(8090, () => {
    console.log('server is up')
})  