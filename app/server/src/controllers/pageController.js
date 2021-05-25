const express = require('express')
const router = express.Router()
const pages = {
  'shops': 'shop',
  'prefectures': 'prefecture',
  'areas': 'area',
  'cities': 'city'
}

const index = (pages) => {
  return (req, res, next) => res.send(pages)
}

// index
router.get('/', index(pages))

module.exports = router