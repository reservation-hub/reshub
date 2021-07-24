const eah = require('express-async-handler')
const express = require('express')

const router = express.Router()
const ShopRepository = require('../../repositories/ShopRepository')

router.get('/', eah(async (req, res) => {
  const limit = req.query.limit || 10
  const shops = await ShopRepository.fetchByCount(limit)
  return res.send(shops)
}))

// faker - フェークのショップデータ作るやつなので無視でお願いします

module.exports = router
