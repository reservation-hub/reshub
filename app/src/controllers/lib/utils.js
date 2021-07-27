const Joi = require('joi')

const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9]+$/),
})

exports.parseIntIDMiddleware = (req, res, next) => {
  const { error, value } = idSchema.validate(req.params)
  if (error) {
    return next({ code: 400, message: 'Invalid param value' })
  }
  res.locals.id = parseInt(value.id, 10)
  return next()
}
