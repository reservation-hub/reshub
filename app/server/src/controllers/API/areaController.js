const eah = require('express-async-handler')
const express = require('express')
const router = express.Router()
const ShopRepository = require('../../repositories/shopRepository')

router.get('/:area', eah(async (req, res, next) => {
  const shops = await ShopRepository.fetchByAreaSlug(req.params)
  return res.send(shops)
}))

router.get('/:area/:prefecture', eah(async (req, res, next) => {
  const shops = await ShopRepository.fetchByAreaAndPrefectureSlugs(req.params)
  return res.send(shops)
}))

router.get('/:area/:prefecture/:city', eah(async (req, res, next) => {
  const shops = await ShopRepository.fetchByAreaAndPrefectureAndCitySlugs(req.params)
  return res.send(shops)
}))

module.exports = router