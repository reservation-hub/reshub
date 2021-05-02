const express = require('express')
const cors = require('cors')
const postRoutes = require('./routes/posts')

const app = express()

app.use(express.json())
app.use(cors())
app.use(postRoutes)

app.listen(8090, () => {
    console.log('server is up')
})  