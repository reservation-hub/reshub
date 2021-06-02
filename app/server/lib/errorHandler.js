exports.errorHandler = (err, req, res, next) => {
  console.log('session : ', req.session)
  console.log('error: ', err)
  // console.log('req: ', req)
  if ("ValidationError" === err.name) {
    const messages = err.details.map(e => {
      return {
        label: e.context.label,
        message: e.message
      }
    })
    return res.status(400).send(messages)
  }

  if (err.name === "DocumentNotFoundError" || err.code === 404) {
    return res.status(404).send({message: 'Error: Not Found'})
  }

  return res.status(500).send({message: 'Internal Server Error'})
}