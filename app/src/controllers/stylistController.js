const router = require('express').Router()
const eah = require('express-async-handler')
const StylistRepository = require('../repositories/StylistRepository')
const ShopRepository = require('../repositories/ShopRepository')
const { parseIntIDMiddleware } = require('./lib/utils')
const { stylistUpsertSchema } = require('./schemas/stylist')
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
    error: fetchStylistsError,
    value: stylists,
  } = await StylistRepository.fetchStylists(
    schemaValues.page,
    schemaValues.order,
    schemaValues.filter,
  )
  if (fetchStylistsError) {
    return next({ code: 500, message: 'Server error', error: fetchStylistsError })
  }

  const {
    error: fetchStylistsCountError,
    value: stylistsCount,
  } = await StylistRepository.totalCount(schemaValues.filter)
  if (fetchStylistsCountError) {
    return next({ code: 500, message: 'Server error', error: fetchStylistsCountError })
  }

  return res.send({ data: stylists, totalCount: stylistsCount })
})

const showStylist = eah(async (req, res, next) => {
  const { id } = res.locals
  const {
    error: stylistFetchError,
    value: stylist,
  } = await StylistRepository.fetchStylist(id)
  if (stylistFetchError) {
    return next({ code: 500, message: 'Server error', error: stylistFetchError })
  }
  if (!stylist) {
    return next({ code: 404, message: 'Stylist not found' })
  }

  return res.send({ data: stylist })
})

const insertStylist = eah(async (req, res, next) => {
  const {
    error: schemaError,
    value: schemaValues,
  } = stylistUpsertSchema.validate(req.body, joiOptions)

  if (schemaError) {
    return next({ code: 400, message: 'Invalid input values', error: schemaError })
  }

  if (schemaValues.image) {
    // TODO: add upload image process
  }

  const {
    error: shopExtractionError,
    value: validShopIDs,
  } = await ShopRepository.findExistingShopIDs(schemaValues.shops)

  if (shopExtractionError) {
    return next({ code: 500, message: 'Server error', error: shopExtractionError })
  }

  const {
    error: insertStylistError,
    value: stylist,
  } = await StylistRepository.insertStylist(
    schemaValues.name,
    validShopIDs,
    schemaValues.image,
  )

  if (insertStylistError) {
    return next({ code: 500, message: 'Insert stylist error', error: insertStylistError })
  }

  if (stylist.image) {
    // TODO clean up image when it's already functional
  }

  return res.send({ data: stylist })
})

const updateStylist = eah(async (req, res, next) => {
  const {
    error: schemaError,
    value: schemaValues,
  } = stylistUpsertSchema.validate(req.body, joiOptions)
  if (schemaError) {
    return next({ code: 400, message: 'Invalid input values', error: schemaError })
  }

  if (schemaValues.image) {
    // TODO: add upload image process
  }

  const {
    error: shopExtractionError,
    value: validShopIDs,
  } = await ShopRepository.findExistingShopIDs(schemaValues.shops)
  if (shopExtractionError) {
    return next({ code: 500, message: 'Server error', error: shopExtractionError })
  }

  const { id } = res.locals

  const {
    error: stylistFetchError,
    value: stylist,
  } = await StylistRepository.findByProps({ id })
  if (stylistFetchError) {
    return next({ code: 500, message: 'Server Error', error: stylistFetchError })
  }
  if (!stylist) {
    return next({ code: 404, message: 'Stylist not found' })
  }

  const stylistShopIDs = stylist.shops.map(shop => shop.shop.id)
  const shopIDsToAdd = validShopIDs.filter(
    validShopID => stylistShopIDs.indexOf(validShopID) === -1,
  )
  const shopIDsToRemove = stylistShopIDs.filter(
    ssid => validShopIDs.indexOf(ssid) === -1,
  )

  const {
    error: updateStylistError,
    value: updatedStylist,
  } = await StylistRepository.updateStylist(
    id,
    schemaValues.name,
    stylist.image,
    schemaValues.image,
    shopIDsToAdd,
    shopIDsToRemove,
  )
  if (updateStylistError) {
    return next({ code: 500, message: 'Update stylist error', error: updateStylistError })
  }

  if (updatedStylist.image) {
    // TODO clean up image when it's already functional
  }

  return res.send({ data: updatedStylist })
})

const deleteStylist = eah(async (req, res, next) => {
  const { id } = res.locals
  const { error } = await StylistRepository.deleteStylist(id)
  if (error) {
    return next({ code: 404, message: 'Stylist not found', error })
  }
  return res.send({ data: { message: 'Stylist deleted' } })
})

router.get('/', index)
router.get('/:id', parseIntIDMiddleware, showStylist)
router.post('/', insertStylist)
router.patch('/:id', parseIntIDMiddleware, updateStylist)
router.delete('/:id', parseIntIDMiddleware, deleteStylist)

module.exports = router
