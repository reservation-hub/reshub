const mongoose = require('mongoose')
const { DB_HOST, dbOptions } = require('./config.js')
const dbHandle = mongoose.connect(DB_HOST, dbOptions)

mongoose.set('autoIndex', process.env.NODE_ENV === 'development')
mongoose.set('autoCreate', process.env.NODE_ENV === 'development')

module.exports = dbHandle