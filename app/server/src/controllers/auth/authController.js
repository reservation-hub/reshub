const router = require('express').Router()

router.use('/google', require('./google'))
router.use('/twitter', require('./twitter'))
router.use('/line', require('./line'))
router.use('/', require('./local'))

module.exports = router