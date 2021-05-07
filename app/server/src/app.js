require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db/mongoose')

// routes
const shopRoutes = require('./routes/shops')
const prefectureRoutes = require('./routes/prefectures')
const adminRoutes = require('./routes/admin')
const { errorHandler } = require('../lib/errorHandler')


const app = express()

app.use(express.json())
app.use(cors())
app.use('/admin', adminRoutes)
app.use('/pref', prefectureRoutes)
app.use(shopRoutes) // index
app.use('*', (req, res, next) => next())
app.use(errorHandler)

app.listen(8090, () => {
    console.log('server is up')
})  