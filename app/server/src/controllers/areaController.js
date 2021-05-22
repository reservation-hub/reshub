const express = require('express')
const router = express.Router()
const { validationSchema: areaSchema, Area } = require('../models/area')
const { crudController } = require('../../lib/crudController')

router.get('/', crudController.index(Area))
router.get('/:slug', crudController.show(Area, {slug: 'slug'}))

exports.router = router