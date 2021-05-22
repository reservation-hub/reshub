const express = require('express')
const router = express.Router()
const pages = {
  'shops': 'shop',
  'prefectures': 'prefecture',
  'areas': 'area',
  'cities': 'city'
}

// index
router.get('/', (req, res, next) => res.send(pages))

exports.router = router