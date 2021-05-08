const express = require('express')
const router = express.Router()

const { City } = require('../models/city')

router.get('/', (req, res, next) => {
  // const fs = require('fs')
  // const data = fs.readFileSync('cities.json')
  // const cities = JSON.parse(data)
  // City.insertMany(cities)
  // .then(result=> {
  //   res.send(result)
  // })
  // .catch(e => next(e))
})

module.exports = router