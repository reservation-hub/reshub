const express = require('express')
const router = express.Router()
const { registerCrud } = require('../controllers/crudController')
const { validationSchema: shopSchema, Shop } = require('../models/shop')

registerCrud(Shop, shopSchema, '', router)

module.exports = router