const express = require('express')
const cors = require('cors')
const db = require('./db/mongoose')

const { errorHandler } = require('../lib/errorHandler')

const app = express()

app.use(express.json())
app.use(cors())
require('./routes')(app)
app.use(errorHandler)

app.listen(8090, () => {
    console.log('server is up')
})  