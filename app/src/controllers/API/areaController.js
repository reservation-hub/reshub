const eah = require('express-async-handler')
const express = require('express')

const router = express.Router()
const ShopRepository = require('../../repositories/ShopRepository')

router.use('/:area/:prefecture/:city', require('./shopController'))

router.get('/:area', eah(async (req, res) => {
  const shops = await ShopRepository.fetchByAreaSlug(req.params)
  return res.send(shops)
}))

router.get('/:area/:prefecture', eah(async (req, res) => {
  const shops = await ShopRepository.fetchByAreaAndPrefectureSlugs(req.params)
  return res.send(shops)
}))

router.get('/:area/:prefecture/:city', eah(async (req, res) => {
  const shops = await ShopRepository.fetchByAreaAndPrefectureAndCitySlugs(req.params)
  return res.send(shops)
}))

module.exports = router
