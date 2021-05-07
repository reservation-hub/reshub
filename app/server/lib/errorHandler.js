exports.errorHandler = (err, req, res, next) => {
  if (err.name === "DocumentNotFoundError" || err.code === 404) {
    return res.status(404).send({message: 'Error: Not Found'})
  }
  console.log(err)
  return res.status(500).send({message: 'Internal Server Error'})
}