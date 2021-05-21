const express = require('express')
const router = express.Router()
const pages = {
  'shops': 'shop',
  'prefectures': 'prefecture',
  'areas': 'area',
  'cities': 'city'
}

router.get('/', (req, res, next) => {

  return res.send(pages)
})

exports.router = router