const express = require('express')
const router = express.Router()

const pages = {
  'shops': 'shop',
  'prefectures': 'prefecture',
  'areas': 'area',
  'cities': 'city'
}

const index = (pages) => {
  return (req, res, next) => {
    return res.send({page: "/"})
  }
}

// index
router.get('/', index(pages))

router.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/')
})

module.exports = router