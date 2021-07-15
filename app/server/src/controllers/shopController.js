const express = require('express')

const router = express.Router()
const { validationSchema: shopSchema, Shop } = require('../models/shop')
const { registerCrud } = require('../../lib/crudController')

// path
registerCrud(/* path /shops/ */Shop, shopSchema, router, { populate: true })

module.exports = router
