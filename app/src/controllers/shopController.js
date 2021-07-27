const router = require('express').Router()
const eah = require('express-async-handler')
const { parseIntIDMiddleware } = require('./lib/utils')
const locationRepository = require('../repositories/LocationRepository')
const ShopRepository = require('../repositories/ShopRepository')
const { shopUpsertSchema } = require('./schemas/shop')
const indexSchema = require('./schemas/indexSchema')

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = eah(async (req, res, next) => {
  const {
    error: schemaError,
    value: schemaValues,
  } = indexSchema.validate(req.query, joiOptions)
  if (schemaError) {
    return next({ code: 400, message: 'Invalid query values', error: schemaError })
  }

  const {
    error: fetchShopsError,
    value: shops,
  } = await ShopRepository.fetchShops(
    schemaValues.page,
    schemaValues.order,
    schemaValues.filter,
  )
  if (fetchShopsError) {
    return next({ code: 500, message: 'Server error', error: fetchShopsError })
  }

  const shopIDs = shops.map(shop => shop.id)

  const {
    error: fetchTotalReservationsCountError,
    value: totalReservationsCount,
  } = await ShopRepository.fetchShopReservationsCountByIDs(shopIDs)
  if (fetchTotalReservationsCountError) {
    return next({ code: 500, message: 'Server error', error: fetchTotalReservationsCountError })
  }

  const {
    error: fetchTotalStylistsCountError,
    value: totalStylistsCount,
  } = await ShopRepository.fetchShopStylistsCountByIDs(shopIDs)
  if (fetchTotalStylistsCountError) {
    return next({ code: 500, message: 'Server error', error: fetchTotalStylistsCountError })
  }

  // merge data
  const data = shops.map(shop => ({
    ...shop,
    reservationsCount: totalReservationsCount[shop.id],
    stylistsCount: totalStylistsCount[shop.id],
  }))

  const {
    error: fetchCountError,
    value: shopCounts,
  } = await ShopRepository.totalCount(schemaValues.filter)
  if (fetchCountError) {
    return next({ code: 500, message: 'Server error', error: fetchCountError })
  }

  return res.send({ data, totalCount: shopCounts })
})

const showShop = eah(async (req, res, next) => {
  const { id } = res.locals
  const { error, value } = await ShopRepository.fetchShop(id)
  if (error) {
    return next({ code: 500, message: 'Server error' })
  }
  if (!value) {
    return next({ code: 404, message: 'Shop Not Found' })
  }

  return res.send({ data: value })
})

const insertShop = eah(async (req, res, next) => {
  const {
    error: shopSchemaError,
    value: shopInsertValues,
  } = shopUpsertSchema.validate(req.body, joiOptions)

  if (shopSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: shopSchemaError })
  }

  const { error: locationsError, value: locationsAreValid } = await locationRepository
    .locationsAreValid(shopInsertValues.areaID, shopInsertValues.prefectureID,
      shopInsertValues.cityID)
  if (locationsError) {
    return next({ code: 500, message: 'DB Error', error: locationsError })
  }

  if (!locationsAreValid) {
    return next({ code: 400, message: 'Locations are invalid' })
  }

  const { error, value: shop } = await ShopRepository.insertShop(
    shopInsertValues.name, shopInsertValues.address, shopInsertValues.phoneNumber,
    shopInsertValues.areaID, shopInsertValues.prefectureID, shopInsertValues.cityID,
  )
  if (error) {
    return next({ code: 400, message: 'Shop insert error' })
  }
  return res.send({ data: shop })
})

const updateShop = eah(async (req, res, next) => {
  const {
    error: shopSchemaError,
    value: shopUpdateValues,
  } = shopUpsertSchema.validate(req.body, joiOptions)

  if (shopSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: shopSchemaError })
  }

  const { error: locationsError, value: locationsAreValid } = await locationRepository
    .locationsAreValid(shopUpdateValues.areaID, shopUpdateValues.prefectureID,
      shopUpdateValues.cityID)
  if (locationsError) {
    return next({ code: 500, message: 'DB Error', error: locationsError })
  }

  if (!locationsAreValid) {
    return next({ code: 400, message: 'Locations are invalid' })
  }

  const { id } = res.locals

  const {
    error: shopFetchError,
    value: shop,
  } = await ShopRepository.findByProps({ id })
  if (shopFetchError) {
    return next({ code: 500, message: 'Server Error', error: shopFetchError })
  }
  if (!shop) {
    return next({ code: 404, message: 'Shop not found' })
  }

  const { error, value: updatedShop } = await ShopRepository.updateShop(
    shop, shopUpdateValues.name, shopUpdateValues.address, shopUpdateValues.phoneNumber,
    shopUpdateValues.areaID, shopUpdateValues.prefectureID, shopUpdateValues.cityID,
  )
  if (error) {
    return next({ code: 400, message: 'Shop update error' })
  }
  return res.send({ data: updatedShop })
})

const deleteShop = eah(async (req, res, next) => {
  const { id } = res.locals
  const { error } = await ShopRepository.deleteShop(id)
  if (error) {
    return next({ code: 404, message: 'Shop not found', error })
  }
  return res.send({ data: { message: 'Shop deleted' } })
})

// routes

router.get('/', index)
router.get('/:id', parseIntIDMiddleware, showShop)
router.post('/', insertShop)
router.patch('/:id', parseIntIDMiddleware, updateShop)
router.delete('/:id', parseIntIDMiddleware, deleteShop)

module.exports = router
