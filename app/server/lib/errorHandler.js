exports.errorHandler = (err, req, res, next) => {
  console.log('error: ', err)
  if ("ValidationError" === err.name) {

    // mongoose model validation エラー処理
    if (err.errors !== undefined && "ValidatorError" === err.errors.details.name) {
      const mongooseErrors = Object.entries(err.errors).map(([key, val]) => {
        return {
          label: key,
          message: val.message
        }
      })
      return res.status(400).send(mongooseErrors)
    }
    //else

    // Joi Validation　エラー処理
    const messages = err.details.map(e => {
      return {
        label: e.context.label,
        message: e.message
      }
    })
    return res.status(400).send(messages)
  }

  if (err.name === "DocumentNotFoundError") {
    return res.status(404).send({message: 'Error: Not Found'})
  }

  if (err.code === 401) {
    return res.status(err.code).redirect('/auth/login')
  }

  return res.status(err.code || 500).send({message: err.message || 'Internal Server Error', data: err.data})
}