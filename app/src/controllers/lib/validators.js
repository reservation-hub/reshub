exports.schemaMiddleware = validationSchema => (req, res, next) => {
  validationSchema.validateAsync(req.body, { abortEarly: false })
    // todo fix validator, change to async await
    // eslint-disable-next-line no-unused-vars
    .then(validated => {
      next()
    })
    .catch(e => next(e))
}
