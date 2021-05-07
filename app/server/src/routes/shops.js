const express = require('express')
const router = express.Router()
const controller = require('../controllers/shopController')

router.get('/', controller.index)
router.get('/:id', controller.show)
router.post('/', controller.insert)
router.patch('/:id', controller.update)
router.delete('/id', controller.delete)

module.exports = router