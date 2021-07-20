const eah = require('express-async-handler')
const express = require('express')

const router = express.Router({ mergeParams: true })
const ShopRepository = require('../../repositories/shopRepository')

router.get('/:shop', eah(async (req, res) => {
  const shop = await ShopRepository.fetchById(req.params)
  return res.send({ data: shop })
}))

module.exports = router
