const express = require('express')
const router = express.Router()
const { Shop } = require('../../models/shop')
const ShopRepository = require('../../repositories/shopRepository')
const shopSeeder = require('../../../lib/shopSeeder')

router.get('/', (req, res, next) => {
  const limit = req.query.limit || 10
  ShopRepository.fetchByCount(limit)
  .then(shops => res.send(shops))
})

// faker

router.get('/fake', shopSeeder(10))

module.exports = router