const router = require('express').Router()
const passport = require('passport')

router.use('/', require('./local'))
router.use('/google', require('./google'))
router.use('/twitter', require('./twitter'))
router.use('/line', require('./line'))
router.get('/test', (req, res, next) => {
  console.log(process.env.TWITTER_API_KEY)
  return res.send({})
})

module.exports = router