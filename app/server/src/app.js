const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const helmet = require('helmet')
const { errorHandler } = require('../lib/errorHandler')

const app = express()

app.use(express.json())
app.use(cookieParser(process.env.JWT_TOKEN_SECRET))
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}))
app.use(helmet())
app.use(passport.initialize())
app.use(passport.session())
require('./routes')(app)

app.use(errorHandler)

module.exports = app
