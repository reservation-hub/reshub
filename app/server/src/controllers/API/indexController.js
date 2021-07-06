const eah = require('express-async-handler')
const express = require('express')
const router = express.Router()
const ShopRepository = require('../../repositories/shopRepository')
const shopSeeder = require('../../../lib/shopSeeder')

router.get('/', eah((req, res, next) => {
  const limit = req.query.limit || 10
  const shops = ShopRepository.fetchByCount(limit)
  return res.send(shops)
}))

// faker - フェークのショップデータ作るやつなので無視でお願いします

router.get('/fake', shopSeeder(10))

module.exports = router