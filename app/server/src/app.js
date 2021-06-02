const express = require('express')
const cors = require('cors')
const db = require('./db/mongoose')
const session = require('express-session')
const passport = require('passport')
const { errorHandler } = require('../lib/errorHandler')

const app = express()

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    require('./models/user').User.findById(id)
    .then(user => done(null, user))
    .catch(e => done(e, null))
});

app.use(express.json())
app.use(cors())
app.use(session({
    secret: 'reservation hub',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true, maxAge: 60 * 60 * 1000 },
    cookie: { maxAge: 60 * 60 * 1000 },
}))
app.use(passport.initialize());
app.use(passport.session());
require('./routes')(app)
app.use(errorHandler)

app.listen(8090, () => {
    console.log('server is up')
})  