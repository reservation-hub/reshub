const express = require('express')
const router = express.Router()
const controller = require('../controllers/prefectureController')

router.get('/', controller.parse)

module.exports = router